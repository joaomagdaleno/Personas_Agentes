import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaSystemControlPlugin } from "../src_local/psa/plugins/core/system_control_plugin.ts";
import * as path from "node:path";

describe("PsaSystemControlPlugin Unit Tests", () => {
    let ctx: PsaContext;
    const testDir = path.resolve(".");

    beforeEach(() => {
        ctx = new PsaContext(testDir);
        ctx.use(new PsaSystemControlPlugin());
    });

    it("should register all 8 system control tools in PSA Micro-Kernel", () => {
        const tools = ctx.tools.list();
        const toolNames = tools.map(t => t.name);

        expect(toolNames).toContain("system.run_diagnostic");
        expect(toolNames).toContain("system.health_score");
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
    }, 15000);

    it("should list agent stacks from agents_registry via PSA tool", async () => {
        const result = await ctx.tools.executeTool("registry.list_stacks", {});
        expect(result.status).toBe("success");
        const data = result.result as any;
        expect(data.totalStacks).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(data.stacks)).toBe(true);
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
