import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaAgentLoop } from "../src_local/psa/core/psa_agent_loop.ts";
import { ZvecGrepPlugin } from "../src_local/psa/plugins/core/zvec_grep_plugin.ts";
import { Idris2Plugin } from "../src_local/psa/plugins/core/idris2_plugin.ts";
import { FSPlugin } from "../src_local/psa/plugins/core/fs_plugin.ts";
import { ShellPlugin } from "../src_local/psa/plugins/core/shell_plugin.ts";
import { InteractionPlugin } from "../src_local/psa/plugins/core/interaction_plugin.ts";
import { CompactionPlugin } from "../src_local/psa/plugins/core/compaction_plugin.ts";
import { MCPPlugin } from "../src_local/psa/plugins/core/mcp_plugin.ts";
import { SubagentPlugin } from "../src_local/psa/plugins/core/subagent_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../src_local/psa/plugins/personas/index.ts";

describe("PSA (Personas & Agentes) — Full Parity Test Suite", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = PsaContext.getInstance(process.cwd());

        // Monta plugins Core
        ctx.use(new ZvecGrepPlugin());
        ctx.use(new Idris2Plugin());
        ctx.use(new FSPlugin());
        ctx.use(new ShellPlugin());
        ctx.use(new InteractionPlugin());
        ctx.use(new CompactionPlugin());
        ctx.use(new MCPPlugin());
        ctx.use(new SubagentPlugin());

        // Monta as 8 Super Personas
        mountAllSuperPersonaPlugins(ctx);
    });

    it("deve inicializar o micro-kernel PsaContext com todos os 8 plugins Core e 8 Personas", () => {
        const plugins = ctx.plugins.list();
        expect(plugins.length).toBeGreaterThanOrEqual(16);

        const pluginNames = plugins.map(p => p.name);
        expect(pluginNames).toContain("psa-plugin-zvec-grep");
        expect(pluginNames).toContain("psa-plugin-idris2-verifier");
        expect(pluginNames).toContain("psa-plugin-fs");
        expect(pluginNames).toContain("psa-plugin-shell");
        expect(pluginNames).toContain("psa-plugin-interaction");
        expect(pluginNames).toContain("psa-plugin-compaction");
        expect(pluginNames).toContain("psa-plugin-mcp-client");
        expect(pluginNames).toContain("psa-plugin-subagent");
    });

    it("deve executar a compactação inteligente de contexto com CompactionPlugin", async () => {
        const testSessionId = `compact_ses_${Date.now()}`;
        ctx.sessions.append(testSessionId, 1, "turn_start", { prompt: "Criar módulo de segurança" });
        ctx.sessions.append(testSessionId, 1, "tool_call", { toolName: "fs.write_file", args: { filePath: "src/security.ts" } });
        ctx.sessions.append(testSessionId, 1, "verification", { text: "Idris 2: Contrato formal verificado" });

        const compactRes = await ctx.tools.executeTool("compaction.compact", { sessionId: testSessionId });

        expect(compactRes.status).toBe("success");
        expect(compactRes.result.sessionId).toBe(testSessionId);
        expect(compactRes.result.touchedFiles).toContain("src/security.ts");
        expect(compactRes.result.distilledContext).toContain("Resumo Compactado de Sessão PSA");
        expect(compactRes.result.tokensSavedEstimate).toBeGreaterThan(0);
    });

    it("deve registrar e despachar ferramentas MCP dinâmicas com MCPPlugin", async () => {
        const regRes = await ctx.tools.executeTool("mcp.register_server", {
            name: "sqlite_database",
            command: "mcp-server-sqlite",
            tools: [
                { name: "read_query", description: "Executa SELECT no SQLite" }
            ]
        });

        expect(regRes.status).toBe("success");
        expect(regRes.result.server).toBe("sqlite_database");

        const tools = ctx.tools.list();
        const mcpTool = tools.find(t => t.name === "mcp.sqlite_database.read_query");
        expect(mcpTool).toBeDefined();

        const execRes = await ctx.tools.executeTool("mcp.sqlite_database.read_query", { sql: "SELECT * FROM users" });
        expect(execRes.status).toBe("success");
        expect(execRes.result.status).toBe("mcp_rpc_success");
    });

    it("deve criar e orquestrar subagentes em sessão concorrente com SubagentPlugin", async () => {
        const parentId = `parent_ses_${Date.now()}`;
        ctx.sessions.create({ sessionId: parentId, persona: "strategic_cognitive_architect", model: "deepseek-v4-pro" });

        const subagentRes = await ctx.tools.executeTool("subagent.spawn", {
            parentSessionId: parentId,
            persona: "audit_code_guardian",
            prompt: "Auditar conformidade dos novos plugins PSA",
            model: "deepseek-v4-flash"
        });

        expect(subagentRes.status).toBe("success");
        expect(subagentRes.result.status).toBe("completed");
        expect(subagentRes.result.childSessionId).toBeDefined();
        expect(subagentRes.result.parentSessionId).toBe(parentId);

        // Verifica que a sessão filha possui parentSessionId gravado
        const sessions = ctx.sessions.listSessions();
        const childSession = sessions.find(s => s.id === subagentRes.result.childSessionId);
        expect(childSession?.parentSessionId).toBe(parentId);
    });

    it("deve executar o PsaAgentLoop com taxonomia completa de eventos", async () => {
        const loop = new PsaAgentLoop(ctx);
        const testSessionId = `loop_psa_${Date.now()}`;

        const events: any[] = [];
        for await (const event of loop.runTurn({
            sessionId: testSessionId,
            prompt: "Diagnóstico e estado de saúde da arquitetura PSA",
            model: "deepseek-v4-pro",
            deepthink: true,
            autoApproveIfTest: true
        })) {
            events.push(event);
        }

        expect(events.length).toBeGreaterThan(0);
        const types = events.map(e => e.type);

        expect(types).toContain("turn_start");
        expect(types).toContain("reasoning");
        expect(types).toContain("text");
        expect(types).toContain("turn_end");
    });
});
