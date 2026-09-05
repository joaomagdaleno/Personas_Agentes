import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext as DshContext } from "../src_local/psa/kernel/psa_context.ts";
import { ZvecGrepPlugin } from "../src_local/psa/plugins/core/zvec_grep_plugin.ts";
import { Idris2Plugin } from "../src_local/psa/plugins/core/idris2_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../src_local/psa/plugins/personas/index.ts";
import { PsaAgentLoop as DshAgentLoop } from "../src_local/psa/core/psa_agent_loop.ts";

describe("DSH Micro-Kernel & Plugin Architecture (Tudo é um Plugin)", () => {
    let ctx: DshContext;

    beforeEach(() => {
        ctx = DshContext.getInstance(process.cwd());
    });

    it("deve inicializar o micro-kernel DshContext com todos os serviços", () => {
        expect(ctx).toBeDefined();
        expect(ctx.plugins).toBeDefined();
        expect(ctx.tools).toBeDefined();
        expect(ctx.events).toBeDefined();
        expect(ctx.sessions).toBeDefined();
        expect(ctx.llm).toBeDefined();
        expect(ctx.telemetry).toBeDefined();
    });

    it("deve registrar plugins Core e as 8 Super Personas no catálogo de plugins", () => {
        ctx.use(new ZvecGrepPlugin());
        ctx.use(new Idris2Plugin());
        mountAllSuperPersonaPlugins(ctx);

        const plugins = ctx.plugins.list();
        expect(plugins.length).toBeGreaterThanOrEqual(10); // 2 core + 8 personas

        const names = plugins.map(p => p.name);
        expect(names.some(n => n.includes("zvec-grep"))).toBe(true);
        expect(names.some(n => n.includes("idris2-verifier"))).toBe(true);
        expect(names).toContain("persona-strategic-cognitive-architect");
        expect(names).toContain("persona-audit-code-guardian");
        expect(names).toContain("persona-security-cloud-guardian");
        expect(names).toContain("persona-architecture-types");
        expect(names).toContain("persona-resilience-healing-architect");
        expect(names).toContain("persona-sys-perf-architect");
        expect(names).toContain("persona-sync-devops-engineer");
        expect(names).toContain("persona-ui-ux-architect");
    });

    it("deve expor ferramentas no DshToolService através de plugins", () => {
        const tools = ctx.tools.list();
        expect(tools.length).toBeGreaterThan(0);

        const toolNames = tools.map(t => t.name);
        expect(toolNames).toContain("zvec_grep.search");
        expect(toolNames).toContain("idris2_verifier.verify");
        expect(toolNames).toContain("strategic.decompose");
        expect(toolNames).toContain("code_auditor.scorecard");
        expect(toolNames).toContain("security.scan_sbom");
        expect(toolNames).toContain("ast_analyzer.inspect");
        expect(toolNames).toContain("auto_healer.repair");
        expect(toolNames).toContain("sys_perf.profile");
        expect(toolNames).toContain("git_sync.status");
        expect(toolNames).toContain("ui_ux.format_digest");
    });

    it("deve executar uma ferramenta através do pipeline waterfall com pre/post hooks", async () => {
        let preExecuted = false;
        ctx.events.on("tools/pre-execute", async (payload) => {
            preExecuted = true;
            return payload;
        });

        const execResult = await ctx.tools.executeTool("strategic.decompose", { goal: "Construir WinUI Nativo" });

        expect(preExecuted).toBe(true);
        expect(execResult.status).toBe("success");
        expect(execResult.result).toBeDefined();
        expect(execResult.result.goal).toBe("Construir WinUI Nativo");
        expect(execResult.result.phases).toBeArray();
    });

    it("deve gravar e recuperar trajetória append-only no DshSessionService com assinatura SHA-256", () => {
        const testSessionId = `test_ses_${Date.now()}`;
        const record = ctx.sessions.append(testSessionId, 1, "turn_start", { prompt: "Test prompt" });

        expect(record.sessionId).toBe(testSessionId);
        expect(record.sha256).toBeDefined();
        expect(record.sha256.length).toBe(64); // SHA-256 hex string

        const trajectory = ctx.sessions.getTrajectory(testSessionId);
        expect(trajectory.length).toBeGreaterThanOrEqual(1);
        expect(trajectory[trajectory.length - 1].type).toBe("turn_start");
    });

    it("deve suportar DeepSeek V4 Flash e DeepSeek V4 Pro no DshLlmService", () => {
        const models = ctx.llm.list();
        const modelIds = models.map(m => m.id);

        expect(modelIds).toContain("deepseek-v4-flash");
        expect(modelIds).toContain("deepseek-v4-pro");

        const proModel = ctx.llm.getModel("deepseek-v4-pro");
        expect(proModel?.supportsReasoning).toBe(true);
        expect(proModel?.contextWindow).toBe(131072);
    });

    it("deve executar um turno completo com DshAgentLoop e emitir taxonomia DSH", async () => {
        const agentLoop = new DshAgentLoop(ctx);
        const testSessionId = `loop_test_${Date.now()}`;

        const events: any[] = [];
        for await (const event of agentLoop.runTurn({
            sessionId: testSessionId,
            prompt: "Como implementar a arquitetura de plugins?",
            model: "deepseek-v4-pro",
            deepthink: true
        })) {
            events.push(event);
        }

        expect(events.length).toBeGreaterThan(0);
        const types = events.map(e => e.type);

        expect(types).toContain("turn_start");
        expect(types).toContain("reasoning");
        expect(types).toContain("text");
        expect(types).toContain("turn_end");

        // Checa telemetria gravada no turn_end
        const endEvent = events.find(e => e.type === "turn_end");
        expect(endEvent?.metadata).toBeDefined();
        expect(endEvent?.metadata.tokensPerSec).toBeDefined();
        expect(endEvent?.metadata.cacheHitRate).toBeDefined();
    }, 20000);
});
