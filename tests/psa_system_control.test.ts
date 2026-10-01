import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaSystemControlPlugin } from "../src_local/psa/plugins/core/system_control_plugin.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧪 PsaSystemControlPlugin Unit Test Suite
 *
 * Strategy: AAA (Arrange, Act, Assert)
 * Component/Layer: src_local/psa/plugins/core/system_control_plugin.ts
 * Purpose: Verify tool registrations and tool execution paths for ecosystem diagnostics,
 *          registry agent queries, AST obfuscation audits, auto-healing, and governance.
 */
describe("PsaSystemControlPlugin Unit Tests", () => {
    let ctx: PsaContext;
    let tempDir: string;
    const projectRoot = path.resolve(".");

    beforeEach(() => {
        PsaContext.resetInstance();
        tempDir = path.resolve(process.cwd(), `.test_sysctrl_${Date.now()}_${Math.random().toString(36).substring(7)}`);
        fs.mkdirSync(tempDir, { recursive: true });
        ctx = PsaContext.getInstance(projectRoot);
        ctx.use(new PsaSystemControlPlugin());
    });

    afterEach(() => {
        PsaContext.resetInstance();
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch {}
    });

    it("should register all 8 system control tools in PSA Micro-Kernel", () => {
        const tools = ctx.tools.list();
        const toolNames = tools.map(t => t.name);

        expect(toolNames).toContain("system.run_diagnostic");
        expect(toolNames).toContain("system.health_score");
        expect(toolNames).toContain("system.export_report_html");
        expect(toolNames).toContain("audit.staged");
        expect(toolNames).toContain("audit.obfuscation_scan");
        expect(toolNames).toContain("registry.list_stacks");
        expect(toolNames).toContain("registry.get_agent_info");
        expect(toolNames).toContain("healing.run_auto_heal");
        expect(toolNames).toContain("native.governance_status");
    });

    it("should query system health score via PSA tool", async () => {
        const result = await ctx.tools.executeTool("system.health_score", {});
        expect(result.status).toBe("success");
        expect(result.result).toBeDefined();
        expect(typeof (result.result as any).healthScore).toBe("number");
    });

    it("should export governance report HTML via system.export_report_html tool", async () => {
        const outputPath = path.join(tempDir, "governance_portal.html");
        const result = await ctx.tools.executeTool("system.export_report_html", { outputPath });

        expect(result.status).toBe("success");
        const data = result.result as any;
        expect(data.success).toBe(true);
        expect(data.targetPath).toBe(outputPath);
        expect(fs.existsSync(outputPath)).toBe(true);

        const htmlContent = fs.readFileSync(outputPath, "utf-8");
        expect(htmlContent).toContain("PSA Governance & Knowledge Graph Portal");
        expect(htmlContent).toContain("<canvas id=\"kgCanvas\"");
    });

    it("should list agent stacks from agents_registry via PSA tool", async () => {
        const result = await ctx.tools.executeTool("registry.list_stacks", {});
        expect(result.status).toBe("success");
        const data = result.result as any;
        expect(data.totalStacks).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(data.stacks)).toBe(true);
    });

    it("should lookup agent details in registry via registry.get_agent_info tool", async () => {
        // Query known agent in registry
        const foundRes = await ctx.tools.executeTool("registry.get_agent_info", { agentName: "bolt" });
        expect(foundRes.status).toBe("success");
        const foundData = foundRes.result as any;
        expect(foundData.status).toBe("success");
        expect(foundData.agent).toBeDefined();

        // Query unknown agent
        const notFoundRes = await ctx.tools.executeTool("registry.get_agent_info", { agentName: "NonExistentAgentXYZ" });
        expect(notFoundRes.status).toBe("success");
        const notFoundData = notFoundRes.result as any;
        expect(notFoundData.status).toBe("not_found");
    });

    it("should run AST obfuscation scan via audit.obfuscation_scan tool", async () => {
        const result = await ctx.tools.executeTool("audit.obfuscation_scan", {});
        expect(result.status).toBe("success");
        const data = result.result as any;
        expect(typeof data.obfuscatedItems).toBe("number");
        expect(Array.isArray(data.findings)).toBe(true);
    });

    it("should run auto-healing pipeline in dryRun mode via healing.run_auto_heal tool", async () => {
        const result = await ctx.tools.executeTool("healing.run_auto_heal", { dryRun: true });
        expect(result.status).toBe("success");
        const data = result.result as any;
        expect(typeof data.findingsEvaluated).toBe("number");
        expect(typeof data.healedCount).toBe("number");
    });

    it("should query hardware governance status and respect Ryzen 7 RAM bounds", async () => {
        const result = await ctx.tools.executeTool("native.governance_status", {});
        expect(result.status).toBe("success");
        const gov = result.result as any;
        expect(gov.cpuCores).toBeGreaterThan(0);
        expect(gov.totalMemoryGb).toBeGreaterThan(0);
        expect(gov.freeMemoryGb).toBeGreaterThan(0);
        expect(gov.status).toBe("OPTIMIZED_FOR_RYZEN_7");
    });
});
