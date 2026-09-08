import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import {
    StrategicCognitivePlugin,
    AuditCodePlugin,
    SecurityCloudPlugin,
    ArchitectureTypesPlugin,
    ResilienceHealingPlugin,
    SysPerfPlugin,
    SyncDevOpsPlugin,
    UIUXArchitectPlugin,
    mountAllSuperPersonaPlugins
} from "../src_local/psa/plugins/personas/index.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧪 Super Persona Plugins Unit Test Suite
 *
 * Test Strategy: AAA (Arrange, Act, Assert)
 * Component/Layer: src_local/psa/plugins/personas/
 * Purpose: Verify tool registration, schema adherence, execution responses,
 *          and safety boundaries across all 8 Super Personas.
 */
describe("8 Super Persona Plugins Unit Tests", () => {
    let ctx: PsaContext;
    let tempDir: string;

    beforeEach(() => {
        PsaContext.resetInstance();
        tempDir = path.resolve(process.cwd(), `.test_personas_${Date.now()}_${Math.random().toString(36).substring(7)}`);
        fs.mkdirSync(tempDir, { recursive: true });
        ctx = PsaContext.getInstance(tempDir);
    });

    afterEach(() => {
        PsaContext.resetInstance();
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch {}
    });

    describe("StrategicCognitivePlugin", () => {
        it("should register cognitive_reasoner.decompose and strategic.decompose tools and return valid strategy phases", async () => {
            const plugin = new StrategicCognitivePlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("cognitive_reasoner.decompose")).toBe(true);
            expect(ctx.tools.has("strategic.decompose")).toBe(true);

            const res = await ctx.tools.executeTool("cognitive_reasoner.decompose", { goal: "Test Goal" });
            expect(res.status).toBe("success");
            expect(res.result.goal).toBe("Test Goal");
            expect(res.result.strategy).toBe("Topological-DeepThink");
            expect(Array.isArray(res.result.phases)).toBe(true);
            expect(res.result.phases.length).toBeGreaterThan(0);

            const aliasRes = await ctx.tools.executeTool("strategic.decompose", { goal: "Alias Test" });
            expect(aliasRes.status).toBe("success");
            expect(aliasRes.result.goal).toBe("Alias Test");
        });
    });

    describe("AuditCodePlugin", () => {
        it("should register code_auditor tools and generate scorecard and file metrics", async () => {
            const plugin = new AuditCodePlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("code_auditor.scorecard")).toBe(true);
            expect(ctx.tools.has("code_auditor.analyze_file")).toBe(true);

            // Test code_auditor.scorecard
            const cardRes = await ctx.tools.executeTool("code_auditor.scorecard", { scope: "fast" });
            expect(cardRes.status).toBe("success");
            expect(typeof cardRes.result.healthScore).toBe("number");
            expect(cardRes.result.scope).toBe("fast");

            // Test code_auditor.analyze_file on non-existent file
            const missingRes = await ctx.tools.executeTool("code_auditor.analyze_file", { filePath: "non_existent.ts" });
            expect(missingRes.status).toBe("success");
            expect(missingRes.result.success).toBe(false);

            // Test code_auditor.analyze_file on real file
            const testFile = path.join(tempDir, "sample.ts");
            fs.writeFileSync(testFile, "export const x = 42;\nexport function hello() { return 'world'; }\n", "utf-8");
            const fileRes = await ctx.tools.executeTool("code_auditor.analyze_file", { filePath: "sample.ts" });
            expect(fileRes.status).toBe("success");
            expect(fileRes.result.success).toBe(true);
        });
    });

    describe("SecurityCloudPlugin", () => {
        it("should register security.scan_sbom and block dangerous tool executions via waterfall hook", async () => {
            const plugin = new SecurityCloudPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("security.scan_sbom")).toBe(true);

            const scanRes = await ctx.tools.executeTool("security.scan_sbom", {});
            expect(scanRes.status).toBe("success");
            expect(scanRes.result.status).toBe("clean");
            expect(scanRes.result.score).toBe(100);

            // Register dummy tool to test security waterfall pattern detection
            ctx.tools.register({
                name: "dummy.run",
                description: "Dummy test tool",
                schema: { type: "object", properties: { cmd: { type: "string" } } },
                execute: async (args: any) => ({ executed: args.cmd })
            });

            // Safe command execution
            const safeRes = await ctx.tools.executeTool("dummy.run", { cmd: "ls -la" });
            expect(safeRes.status).toBe("success");

            // Dangerous command execution (process.exit)
            expect(ctx.tools.executeTool("dummy.run", { cmd: "process.exit(1)" })).rejects.toThrow("bloqueada pelo portão de segurança");
        });
    });

    describe("ArchitectureTypesPlugin", () => {
        it("should inspect AST invariants and compute architectural depth metrics", async () => {
            const plugin = new ArchitectureTypesPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("ast_analyzer.inspect")).toBe(true);
            expect(ctx.tools.has("ast_analyzer.depth_audit")).toBe(true);

            // Create safe sample module
            const safeFile = path.join(tempDir, "safe_module.ts");
            fs.writeFileSync(safeFile, "export function add(a: number, b: number) { return a + b; }", "utf-8");

            const inspectSafe = await ctx.tools.executeTool("ast_analyzer.inspect", { modulePath: "safe_module.ts" });
            expect(inspectSafe.status).toBe("success");
            expect(inspectSafe.result.success).toBe(true);
            expect(inspectSafe.result.invariantsPreserved).toBe(true);

            // Create dangerous sample module
            const dangerousFile = path.join(tempDir, "unsafe_module.ts");
            fs.writeFileSync(dangerousFile, "export function dangerous() { eval('console.log(1)'); }", "utf-8");

            const inspectDangerous = await ctx.tools.executeTool("ast_analyzer.inspect", { modulePath: "unsafe_module.ts" });
            expect(inspectDangerous.status).toBe("success");
            expect(inspectDangerous.result.success).toBe(true);
            expect(inspectDangerous.result.invariantsPreserved).toBe(false);

            // Test depth_audit
            const depthRes = await ctx.tools.executeTool("ast_analyzer.depth_audit", { files: ["safe_module.ts"] });
            expect(depthRes.status).toBe("success");
            expect(depthRes.result.depthSummary).toBeDefined();
        });
    });

    describe("ResilienceHealingPlugin", () => {
        it("should register auto_healer.repair tool as exclusive and return repair patch", async () => {
            const plugin = new ResilienceHealingPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("auto_healer.repair")).toBe(true);

            const repairRes = await ctx.tools.executeTool("auto_healer.repair", {
                errorLog: "TypeError: Cannot read property 'id' of undefined",
                targetFile: "src/service.ts"
            });

            expect(repairRes.status).toBe("success");
            expect(repairRes.result.healed).toBe(true);
            expect(repairRes.result.targetFile).toBe("src/service.ts");
            expect(repairRes.result.patchApplied).toBeDefined();
        });
    });

    describe("SysPerfPlugin", () => {
        it("should profile system performance and return RAM and CPU metrics", async () => {
            const plugin = new SysPerfPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("sys_perf.profile")).toBe(true);

            const perfRes = await ctx.tools.executeTool("sys_perf.profile", {});
            expect(perfRes.status).toBe("success");
            expect(typeof perfRes.result.rssMb).toBe("number");
            expect(typeof perfRes.result.heapUsedMb).toBe("number");
            expect(perfRes.result.cpuCores).toBeGreaterThan(0);
            expect(perfRes.result.totalMemoryGb).toBeGreaterThan(0);
        });
    });

    describe("SyncDevOpsPlugin", () => {
        it("should report git status and resolve conflicts using strategy", async () => {
            const plugin = new SyncDevOpsPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("git_sync.status")).toBe(true);
            expect(ctx.tools.has("git_sync.resolve")).toBe(true);

            const statusRes = await ctx.tools.executeTool("git_sync.status", {});
            expect(statusRes.status).toBe("success");
            expect(statusRes.result.status).toBeDefined();
            expect(statusRes.result.branch).toBe("main");

            const resolveRes = await ctx.tools.executeTool("git_sync.resolve", { strategy: "ours" });
            expect(resolveRes.status).toBe("success");
            expect(resolveRes.result.resolved).toBe(true);
            expect(resolveRes.result.strategy).toBe("ours");
        });
    });

    describe("UIUXArchitectPlugin", () => {
        it("should format trajectory digest and render native UI card specs", async () => {
            const plugin = new UIUXArchitectPlugin();
            await ctx.use(plugin);

            expect(ctx.tools.has("ui_ux.format_digest")).toBe(true);
            expect(ctx.tools.has("ui_ux.render_card")).toBe(true);

            const digestRes = await ctx.tools.executeTool("ui_ux.format_digest", {
                sessionId: "test-session-123",
                turns: [{ id: 1 }, { id: 2 }]
            });
            expect(digestRes.status).toBe("success");
            expect(digestRes.result.sessionId).toBe("test-session-123");
            expect(digestRes.result.formattedDigest).toContain("test-session-123");
            expect(digestRes.result.displayTheme).toBe("psa-winui-dark-acrylic");

            const cardRes = await ctx.tools.executeTool("ui_ux.render_card", {
                title: "Build Success",
                content: "All 124 tests passed successfully",
                status: "success"
            });
            expect(cardRes.status).toBe("success");
            expect(cardRes.result.nativeCardType).toBe("PsaTrajectoryCard");
            expect(cardRes.result.title).toBe("Build Success");
            expect(cardRes.result.statusBadge).toBe("success");
        });
    });

    describe("mountAllSuperPersonaPlugins", () => {
        it("should mount all 8 Super Personas onto PsaContext seamlessly", () => {
            mountAllSuperPersonaPlugins(ctx);

            const detailed = ctx.plugins.listDetailed();
            expect(detailed.length).toBeGreaterThanOrEqual(8);

            // Verify core tools from all 8 personas exist
            const expectedTools = [
                "cognitive_reasoner.decompose",
                "code_auditor.scorecard",
                "security.scan_sbom",
                "ast_analyzer.inspect",
                "auto_healer.repair",
                "sys_perf.profile",
                "git_sync.status",
                "ui_ux.render_card"
            ];

            for (const tool of expectedTools) {
                expect(ctx.tools.has(tool)).toBe(true);
            }
        });
    });
});
