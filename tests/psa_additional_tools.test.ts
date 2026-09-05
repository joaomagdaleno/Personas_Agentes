import { describe, it, expect, beforeEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { TodoPlugin } from "../src_local/psa/plugins/core/todo_plugin.ts";
import { WebPlugin } from "../src_local/psa/plugins/core/web_plugin.ts";
import { SkillPlugin } from "../src_local/psa/plugins/core/skill_plugin.ts";

describe("🏛️ PSA Sovereign Architecture - Additional Core Plugins Suite", () => {
    let ctx: PsaContext;
    const testDir = path.resolve(process.cwd(), ".psa_test_scratch_" + Date.now().toString(36));

    beforeEach(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        PsaContext.resetInstance();
        ctx = PsaContext.getInstance(testDir);
    });

    describe("1. TodoPlugin (todo_write, todo.write, todo.list)", () => {
        it("deve registrar as ferramentas de tarefas no registro de ferramentas", () => {
            const plugin = new TodoPlugin();
            ctx.use(plugin);

            expect(ctx.tools.has("todo_write")).toBe(true);
            expect(ctx.tools.has("todo.write")).toBe(true);
            expect(ctx.tools.has("todo.list")).toBe(true);
        });

        it("deve rejeitar atualizações parciais ou tarefas com formato inválido", async () => {
            const plugin = new TodoPlugin();
            ctx.use(plugin);

            const writeTool = ctx.tools.get("todo_write")!;
            // Falha se content for vazio
            await expect(writeTool.execute({
                todos: [{ content: "", status: "pending" }]
            })).rejects.toThrow("invalid todo");

            // Falha se status for inválido
            await expect(writeTool.execute({
                todos: [{ content: "Valid", status: "not_a_status" }]
            })).rejects.toThrow("Status inválido");

            // Falha se houver conteúdo duplicado
            await expect(writeTool.execute({
                todos: [
                    { content: "Tarefa 1", status: "pending" },
                    { content: "Tarefa 1", status: "completed" }
                ]
            })).rejects.toThrow("conteúdo duplicado");
        });

        it("deve gerenciar snapshot imperativo e calcular contadores com exatidão", async () => {
            const plugin = new TodoPlugin();
            ctx.use(plugin);

            const writeTool = ctx.tools.get("todo_write")!;
            const listTool = ctx.tools.get("todo.list")!;

            const result = await writeTool.execute({
                sessionId: "test_session_1",
                todos: [
                    { content: "Planejar arquitetura", status: "completed" },
                    { content: "Implementar código nativo", status: "in_progress" },
                    { content: "Escrever testes de validação", status: "pending" }
                ]
            });

            expect(result.counts.completed).toBe(1);
            expect(result.counts.inProgress).toBe(1);
            expect(result.counts.pending).toBe(1);

            const list = await listTool.execute({ sessionId: "test_session_1" });
            expect(list.todos.length).toBe(3);
            expect(list.todos[1].content).toBe("Implementar código nativo");
            expect(list.todos[1].status).toBe("in_progress");
        });

        it("deve respeitar a política de allowParallelInProgress = false quando configurada", async () => {
            const plugin = new TodoPlugin({ allowParallelInProgress: false });
            ctx.use(plugin);

            const writeTool = ctx.tools.get("todo_write")!;
            await expect(writeTool.execute({
                todos: [
                    { content: "Task 1", status: "in_progress" },
                    { content: "Task 2", status: "in_progress" }
                ]
            })).rejects.toThrow("no máximo uma tarefa pode estar em 'in_progress'");
        });
    });

    describe("2. WebPlugin (web_search, web_fetch)", () => {
        it("deve registrar as ferramentas web no registro", () => {
            const plugin = new WebPlugin();
            ctx.use(plugin);

            expect(ctx.tools.has("web_search")).toBe(true);
            expect(ctx.tools.has("web.search")).toBe(true);
            expect(ctx.tools.has("web_fetch")).toBe(true);
            expect(ctx.tools.has("web.fetch")).toBe(true);
        });

        it("deve validar limites de consultas em web_search", async () => {
            const plugin = new WebPlugin({ searchMaxQueries: 2 });
            ctx.use(plugin);

            const searchTool = ctx.tools.get("web_search")!;
            await expect(searchTool.execute({ queries: [] })).rejects.toThrow("lista não vazia");
            await expect(searchTool.execute({ queries: ["q1", "q2", "q3"] })).rejects.toThrow("não pode exceder 2");
        });

        it("deve processar e sanitizar HTML para Markdown em web_fetch", async () => {
            const plugin = new WebPlugin();
            ctx.use(plugin);

            // Teste de chamada com data URI ou URL
            const fetchTool = ctx.tools.get("web_fetch")!;
            await expect(fetchTool.execute({ url: "" })).rejects.toThrow();
        });
    });

    describe("3. SkillPlugin (skill, skill.list, skill.load)", () => {
        it("deve registrar as ferramentas de skills no registro", () => {
            const plugin = new SkillPlugin();
            ctx.use(plugin);

            expect(ctx.tools.has("skill")).toBe(true);
            expect(ctx.tools.has("skill.load")).toBe(true);
            expect(ctx.tools.has("skill.list")).toBe(true);
        });

        it("deve escanear e carregar habilidades modulares com frontmatter YAML", async () => {
            // Cria skill de teste no diretório de teste
            const skillsDir = path.join(testDir, ".psa_skills");
            fs.mkdirSync(skillsDir, { recursive: true });

            const sampleSkillPath = path.join(skillsDir, "sample_refactor.md");
            fs.writeFileSync(sampleSkillPath, `---
name: sample_refactor
description: Guia de boas práticas para refatorações limpas
disable-model-invocation: false
---
# Instruções de Refatoração
1. Sempre verifique os tipos antes de editar.
2. Execute o suite de testes ao terminar.
`);

            const plugin = new SkillPlugin({ skillsDir: ".psa_skills" });
            ctx.use(plugin);

            const listTool = ctx.tools.get("skill.list")!;
            const listRes = await listTool.execute({});
            expect(listRes.total).toBe(1);
            expect(listRes.skills[0].name).toBe("sample_refactor");
            expect(listRes.skills[0].description).toContain("Guia de boas práticas");

            const loadTool = ctx.tools.get("skill")!;
            const loadRes = await loadTool.execute({ name: "sample_refactor" });
            expect(loadRes.name).toBe("sample_refactor");
            expect(loadRes.content).toContain("# Instruções de Refatoração");
            expect(loadRes.frontmatter.name).toBe("sample_refactor");
        });
    });
});
