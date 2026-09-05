import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { SqliteStoragePlugin } from "../src_local/psa/plugins/core/sqlite_storage_plugin.ts";
import { GithubWebhookPlugin } from "../src_local/psa/plugins/core/github_webhook_plugin.ts";
import { TerminalPtyPlugin } from "../src_local/psa/plugins/core/terminal_pty_plugin.ts";
import { LspPlugin } from "../src_local/psa/plugins/core/lsp_plugin.ts";

describe("🏛️ PSA Sovereign Architecture - Expanded Modules Suite", () => {
    let ctx: PsaContext;
    const testDir = path.resolve(process.cwd(), ".psa_test_scratch_exp_" + Date.now().toString(36));

    beforeEach(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        PsaContext.resetInstance();
        ctx = PsaContext.getInstance(testDir);
    });

    afterEach(() => {
        try {
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, { recursive: true, force: true });
            }
        } catch {}
    });

    describe("1. SqliteStoragePlugin (bun:sqlite, session.search, session_query_sql)", () => {
        it("deve criar banco de dados SQLite, indexar sessões e responder a consultas SQL de forma segura", async () => {
            const dbPath = path.join(testDir, "test_storage.sqlite");
            const plugin = new SqliteStoragePlugin({ dbPath });
            ctx.use(plugin);

            expect(ctx.tools.has("session_search")).toBe(true);
            expect(ctx.tools.has("session_query_sql")).toBe(true);
            expect(ctx.tools.has("session_event_read")).toBe(true);

            // Indexa uma sessão e um evento
            plugin.indexSession({
                id: "ses_abc_123",
                createdAt: new Date().toISOString(),
                persona: "audit_code_guardian",
                model: "deepseek-v4-pro",
                workspace: testDir
            });

            plugin.indexEvent({
                sessionId: "ses_abc_123",
                index: 1,
                turnIndex: 1,
                type: "tool_result",
                timestamp: new Date().toISOString(),
                payload: { message: "Compilação verificada com sucesso em Idris 2" },
                sha256: "fake_hash_123"
            });

            // Executa consulta SQL segura
            const sqlTool = ctx.tools.get("session_query_sql")!;
            const res = await sqlTool.execute({
                sql: "SELECT id, persona, total_events FROM sessions WHERE id = 'ses_abc_123'"
            });

            expect(res.count).toBe(1);
            expect(res.rows[0].persona).toBe("audit_code_guardian");
            expect(res.rows[0].total_events).toBe(1);

            // Rejeita tentativas de mutação de dados via SQL do modelo
            await expect(sqlTool.execute({
                sql: "DROP TABLE sessions"
            })).rejects.toThrow("PsaSqliteSecurity");

            plugin.close();
        });
    });

    describe("2. GithubWebhookPlugin (HMAC-SHA256 & CI/CD autônomo)", () => {
        it("deve validar assinaturas criptográficas e despachar eventos de CI/CD", async () => {
            const secret = "test_sovereign_secret";
            const plugin = new GithubWebhookPlugin({ secret });
            ctx.use(plugin);

            expect(ctx.tools.has("github.list_webhooks")).toBe(true);
            expect(ctx.tools.has("github.dispatch_webhook")).toBe(true);

            const dispatchTool = ctx.tools.get("github.dispatch_webhook")!;
            const res = await dispatchTool.execute({
                event: "pull_request",
                payload: {
                    action: "opened",
                    repository: { full_name: "joaomagdaleno/Personas_Agentes" },
                    sender: { login: "contributor_1" }
                }
            });

            expect(res.success).toBe(true);
            expect(res.event).toBe("pull_request");

            const listTool = ctx.tools.get("github.list_webhooks")!;
            const listRes = await listTool.execute({ limit: 5 });
            expect(listRes.total).toBe(1);
            expect(listRes.events[0].repository).toBe("joaomagdaleno/Personas_Agentes");
        });
    });

    describe("3. TerminalPtyPlugin (Terminal interativo contínuo)", () => {
        it("deve instanciar processo interativo, ler buffer e encerrar sessão", async () => {
            const plugin = new TerminalPtyPlugin();
            ctx.use(plugin);

            expect(ctx.tools.has("terminal.create")).toBe(true);
            expect(ctx.tools.has("terminal.send")).toBe(true);
            expect(ctx.tools.has("terminal.read")).toBe(true);
            expect(ctx.tools.has("terminal.kill")).toBe(true);

            const createTool = ctx.tools.get("terminal.create")!;
            const ptySessionId = `test_pty_${Date.now()}`;
            const created = await createTool.execute({ sessionId: ptySessionId });
            expect(created.status).toBe("running");

            // Envia um comando
            const sendTool = ctx.tools.get("terminal.send")!;
            await sendTool.execute({
                sessionId: ptySessionId,
                input: "Write-Output 'PSA_NATIVE_TERMINAL_ONLINE'"
            });

            // Aguarda alguns ms para captura do buffer
            await new Promise(r => setTimeout(r, 400));

            const readTool = ctx.tools.get("terminal.read")!;
            const readRes = await readTool.execute({ sessionId: ptySessionId });
            expect(readRes.output).toContain("PSA_NATIVE_TERMINAL_ONLINE");

            // Encerra
            const killTool = ctx.tools.get("terminal.kill")!;
            const killRes = await killTool.execute({ sessionId: ptySessionId });
            expect(killRes.status).toBe("killed");

            plugin.closeAll();
        });
    });

    describe("4. LspPlugin (Navegação semântica e diagnósticos)", () => {
        it("deve encontrar definições de símbolos e realizar diagnóstico estático", async () => {
            const plugin = new LspPlugin();
            ctx.use(plugin);

            expect(ctx.tools.has("lsp.get_definition")).toBe(true);
            expect(ctx.tools.has("lsp.find_references")).toBe(true);
            expect(ctx.tools.has("lsp.get_diagnostics")).toBe(true);

            // Cria um arquivo de teste TypeScript
            const sampleFile = path.join(testDir, "sample_service.ts");
            fs.writeFileSync(sampleFile, `
export class SampleCalculator {
    public add(a: number, b: number): number {
        return a + b;
    }
}
`);

            const defTool = ctx.tools.get("lsp.get_definition")!;
            const defRes = await defTool.execute({ symbol: "SampleCalculator", fileHint: sampleFile });
            expect(defRes.definitionsCount).toBeGreaterThanOrEqual(1);
            expect(defRes.definitions[0].preview).toContain("class SampleCalculator");

            const diagTool = ctx.tools.get("lsp.get_diagnostics")!;
            const diagRes = await diagTool.execute({ filePath: sampleFile });
            expect(diagRes.clean).toBe(true);
            expect(diagRes.diagnosticsCount).toBe(0);
        });
    });
});
