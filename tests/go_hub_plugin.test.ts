import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin.ts";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * 🧪 GoHubPlugin Unit Test Suite
 *
 * Strategy: AAA (Arrange, Act, Assert)
 * Component/Layer: src_local/psa/plugins/native/go_hub_plugin.ts
 * Purpose: Verify tool registration, schema adherence, gRPC connection status metrics,
 *          and knowledge graph query execution with fallback handling.
 */
describe("GoHubPlugin Native Unit Tests", () => {
    let ctx: PsaContext;
    let tempDir: string;

    beforeEach(() => {
        PsaContext.resetInstance();
        tempDir = path.resolve(process.cwd(), `.test_gohub_${Date.now()}_${Math.random().toString(36).substring(7)}`);
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

    it("should register GoHubPlugin metadata and tools into PsaContext", async () => {
        // Arrange
        const plugin = new GoHubPlugin();

        // Act
        await ctx.use(plugin);

        // Assert
        expect(plugin.name).toBe("native-go-hub");
        expect(plugin.version).toBe("2.0.0");
        expect(ctx.tools.has("native.hub_status")).toBe(true);
        expect(ctx.tools.has("native.hub_knowledge_graph")).toBe(true);
    });

    it("should execute native.hub_status and return IPC and circuit breaker metadata", async () => {
        // Arrange
        const plugin = new GoHubPlugin();
        await ctx.use(plugin);

        // Act
        const res = await ctx.tools.executeTool("native.hub_status", {});

        // Assert
        expect(res.status).toBe("success");
        const statusData = res.result as any;
        expect(["ONLINE", "OFFLINE_DEGRADED"]).toContain(statusData.status);
        expect(typeof statusData.healthy).toBe("boolean");
        expect(statusData.host).toBe("127.0.0.1:50051");
        expect(statusData.transport).toBe("gRPC over HTTP/2");
        expect(statusData.maxMessageBuffer).toBe("128 MB");
        expect(statusData.circuitBreaker).toBe("ARMED");
    });

    it("should execute native.hub_knowledge_graph with default and custom focus/depth parameters", async () => {
        // Arrange
        const plugin = new GoHubPlugin();
        await ctx.use(plugin);

        // Act - Default parameters
        const defaultRes = await ctx.tools.executeTool("native.hub_knowledge_graph", {});

        // Assert - Default
        expect(defaultRes.status).toBe("success");
        const defaultData = defaultRes.result as any;
        expect(["success", "fallback"]).toContain(defaultData.status);
        expect(defaultData.data).toBeDefined();

        // Act - Custom focus and depth
        const customRes = await ctx.tools.executeTool("native.hub_knowledge_graph", {
            focus: "src_local/psa",
            depth: 2
        });

        // Assert - Custom
        expect(customRes.status).toBe("success");
        const customData = customRes.result as any;
        expect(["success", "fallback"]).toContain(customData.status);
        expect(customData.data).toBeDefined();
    });
});
