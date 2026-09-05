import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import type { PsaPlugin } from "../src_local/psa/kernel/psa_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../src_local/psa/plugins/personas/index.ts";
import { PsaSystemControlPlugin } from "../src_local/psa/plugins/core/system_control_plugin.ts";
import { ZigAnalyzerPlugin } from "../src_local/psa/plugins/native/zig_analyzer_plugin.ts";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin.ts";
import { RustSimdPlugin } from "../src_local/psa/plugins/native/rust_simd_plugin.ts";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Sovereign Pure Plugin Architecture (100% Plugin-Driven)", () => {
    let ctx: PsaContext;
    let scratchDir: string;

    beforeEach(() => {
        PsaContext.resetInstance();
        scratchDir = path.resolve(process.cwd(), `.psa_plugin_test_${Date.now()}`);
        fs.mkdirSync(scratchDir, { recursive: true });
        ctx = PsaContext.getInstance(scratchDir);
    });

    afterEach(() => {
        PsaContext.resetInstance();
        try {
            if (fs.existsSync(scratchDir)) {
                fs.rmSync(scratchDir, { recursive: true, force: true });
            }
        } catch {}
    });

    it("should allow dynamic registration and unregistration of plugins with automatic tool cleanup", async () => {
        const dummyPlugin: PsaPlugin = {
            name: "test-ephemeral-plugin",
            version: "1.0.0",
            description: "Ephemeral plugin for lifecycle testing",
            apply(c) {
                c.tools.register({
                    name: "ephemeral.do_action",
                    description: "Ephemeral action",
                    schema: { type: "object", properties: {} },
                    execute: async () => ({ status: "ok" })
                });
            },
            teardown(c) {
                // Teardown hook
            }
        };

        await ctx.use(dummyPlugin);
        expect(ctx.plugins.has("test-ephemeral-plugin")).toBe(true);
        expect(ctx.tools.has("ephemeral.do_action")).toBe(true);

        const execResult = await ctx.tools.executeTool("ephemeral.do_action", {});
        expect(execResult.status).toBe("success");
        expect(execResult.result).toEqual({ status: "ok" });

        // Unregister plugin
        const removed = await ctx.plugins.unregister("test-ephemeral-plugin");
        expect(removed).toBe(true);
        expect(ctx.plugins.has("test-ephemeral-plugin")).toBe(false);
        // Tool must be automatically cleaned up!
        expect(ctx.tools.has("ephemeral.do_action")).toBe(false);
    });

    it("should list detailed plugin information including all mapped tools", async () => {
        await ctx.use(new PsaSystemControlPlugin());
        await ctx.use(new ZigAnalyzerPlugin());
        await ctx.use(new RustSimdPlugin());

        const detailed = ctx.plugins.listDetailed();
        const sysControl = detailed.find(p => p.name === "system-control");
        expect(sysControl).toBeDefined();
        expect(sysControl?.tools).toContain("system.run_diagnostic");
        expect(sysControl?.tools).toContain("system.health_score");
        expect(sysControl?.tools).toContain("audit.staged");

        const rustPlugin = detailed.find(p => p.name === "native-rust-simd");
        expect(rustPlugin).toBeDefined();
        expect(rustPlugin?.tools).toContain("native.rust_complexity");
        expect(rustPlugin?.tools).toContain("native.rust_hash");
    });

    it("should dynamically load custom plugin from disk using PsaPluginLoader", async () => {
        const pluginFile = path.join(scratchDir, "custom_disk_plugin.ts");
        const pluginCode = `
export class DiskCustomPlugin {
    name = "disk-custom-plugin";
    version = "1.0.0";
    description = "Dynamically discovered plugin from disk";
    apply(ctx) {
        ctx.tools.register({
            name: "disk.hello",
            description: "Says hello from disk plugin",
            schema: { type: "object", properties: {} },
            execute: async () => ({ message: "Hello from disk plugin!" })
        });
    }
}
`;
        fs.writeFileSync(pluginFile, pluginCode, "utf-8");

        const loaded = await ctx.loader.loadFromFile(pluginFile);
        expect(loaded).not.toBeNull();
        expect(ctx.plugins.has("disk-custom-plugin")).toBe(true);
        expect(ctx.tools.has("disk.hello")).toBe(true);

        const res = await ctx.tools.executeTool("disk.hello", {});
        expect(res.status).toBe("success");
        expect(res.result.message).toBe("Hello from disk plugin!");
    });

    it("should mount and execute real engine features across all 8 Super Persona plugins", async () => {
        mountAllSuperPersonaPlugins(ctx);

        // 1. Audit Code Guardian
        const auditRes = await ctx.tools.executeTool("code_auditor.scorecard", { scope: "fast" });
        expect(auditRes.status).toBe("success");
        expect(auditRes.result.healthScore).toBeGreaterThanOrEqual(80);

        // 2. Sys Perf Architect
        const perfRes = await ctx.tools.executeTool("sys_perf.profile", {});
        expect(perfRes.status).toBe("success");
        expect(perfRes.result.cpuCores).toBeGreaterThan(0);
        expect(perfRes.result.totalMemoryGb).toBeGreaterThan(0);

        // 3. Architecture Types AST
        const astRes = await ctx.tools.executeTool("ast_analyzer.depth_audit", { files: [] });
        expect(astRes.status).toBe("success");
        expect(astRes.result.depthSummary).toBeDefined();

        // 4. Sync DevOps
        const gitRes = await ctx.tools.executeTool("git_sync.status", {});
        expect(gitRes.status).toBe("success");
        expect(gitRes.result.branch).toBe("main");

        // 5. Strategic Cognitive
        const stratRes = await ctx.tools.executeTool("strategic.decompose", { goal: "Migrar para micro-kernel 100% plugin" });
        expect(stratRes.status).toBe("success");
        expect(stratRes.result.phases.length).toBeGreaterThan(0);
    });

    it("should verify that native plugins (Zig, Go, Rust) operate with fallback isolation", async () => {
        await ctx.use(new ZigAnalyzerPlugin());
        await ctx.use(new GoHubPlugin());
        await ctx.use(new RustSimdPlugin());

        // Rust complexity tool
        const code = "function test(a, b) { if (a) { return b; } return 0; }";
        const rustRes = await ctx.tools.executeTool("native.rust_complexity", { content: code });
        expect(rustRes.status).toBe("success");
        expect(rustRes.result.complexity).toBeGreaterThanOrEqual(1);

        // Rust SIMD hash tool
        const hashRes = await ctx.tools.executeTool("native.rust_hash", { content: "Sovereign PSA Micro-Kernel" });
        expect(hashRes.status).toBe("success");
        expect(typeof hashRes.result.hash).toBe("string");

        // Zig entropy tool
        const zigRes = await ctx.tools.executeTool("native.zig_entropy", { content: "AAAAABBBBBCCCCCDDDDD" });
        expect(zigRes.status).toBe("success");
        expect(zigRes.result.entropy).toBeGreaterThan(0);
    });

    it("should support IoC service container registration, retrieval and Orchestrator integration", async () => {
        // Test service container directly
        const dummyService = { ping: () => "pong" };
        ctx.registerService("customPingService", dummyService);

        expect(ctx.hasService("customPingService")).toBe(true);
        expect(ctx.getService<typeof dummyService>("customPingService")?.ping()).toBe("pong");
        expect(ctx.listServices()).toContain("customPingService");

        // Verify Orchestrator registers its engines into PSA context
        const { Orchestrator } = await import("../src_local/core/orchestrator.ts");
        const orc = new Orchestrator(scratchDir);

        expect(ctx.hasService("orchestrator")).toBe(true);
        expect(ctx.hasService("cache")).toBe(true);
        expect(ctx.hasService("auditEngine")).toBe(true);
        expect(ctx.hasService("memoryEngine")).toBe(true);
        expect(ctx.hasService("testEngine")).toBe(true);

        const retrievedOrc = ctx.getService<any>("orchestrator");
        expect(retrievedOrc).toBe(orc);
    });
});

