import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin.ts";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc.ts";
import * as fs from "node:fs";
import * as path from "node:path";

describe("GoHubPlugin Native Plugin Unit Tests", () => {
    let ctx: PsaContext;
    let scratchDir: string;
    let plugin: GoHubPlugin;

    beforeEach(() => {
        PsaContext.resetInstance();
        scratchDir = path.resolve(process.cwd(), `.psa_gohub_test_${Date.now()}`);
        fs.mkdirSync(scratchDir, { recursive: true });
        ctx = PsaContext.getInstance(scratchDir);
        plugin = new GoHubPlugin();
    });

    afterEach(() => {
        PsaContext.resetInstance();
        try {
            if (fs.existsSync(scratchDir)) {
                fs.rmSync(scratchDir, { recursive: true, force: true });
            }
        } catch {}
    });

    it("should register plugin metadata and tools in PsaContext", async () => {
        // Arrange
        expect(plugin.name).toBe("native-go-hub");
        expect(plugin.version).toBe("2.0.0");
        expect(plugin.description).toContain("Go Hub Proxy");

        // Act
        await ctx.use(plugin);

        // Assert
        expect(ctx.plugins.has("native-go-hub")).toBe(true);
        expect(ctx.tools.has("native.hub_status")).toBe(true);
        expect(ctx.tools.has("native.hub_knowledge_graph")).toBe(true);
    });

    it("should execute native.hub_status tool and return connectivity metrics", async () => {
        // Arrange
        await ctx.use(plugin);
        const hub = HubManagerGRPC.getInstance();
        const spyIsHealthy = spyOn(hub, "isHealthy").mockImplementation(async () => true);

        try {
            // Act
            const res = await ctx.tools.executeTool("native.hub_status", {});

            // Assert
            expect(res.status).toBe("success");
            expect(res.result).toEqual({
                status: "ONLINE",
                healthy: true,
                host: "127.0.0.1:50051",
                transport: "gRPC over HTTP/2",
                maxMessageBuffer: "128 MB",
                circuitBreaker: "ARMED"
            });
        } finally {
            spyIsHealthy.mockRestore();
        }
    });

    it("should execute native.hub_status tool with OFFLINE_DEGRADED status when hub is unhealthy", async () => {
        // Arrange
        await ctx.use(plugin);
        const hub = HubManagerGRPC.getInstance();
        const spyIsHealthy = spyOn(hub, "isHealthy").mockImplementation(async () => false);

        try {
            // Act
            const res = await ctx.tools.executeTool("native.hub_status", {});

            // Assert
            expect(res.status).toBe("success");
            expect(res.result.status).toBe("OFFLINE_DEGRADED");
            expect(res.result.healthy).toBe(false);
        } finally {
            spyIsHealthy.mockRestore();
        }
    });

    it("should execute native.hub_knowledge_graph tool successfully with default and custom arguments", async () => {
        // Arrange
        await ctx.use(plugin);
        const hub = HubManagerGRPC.getInstance();
        const mockGraphData = { nodes: [{ id: "A" }], edges: [] };
        const spyGraph = spyOn(hub, "getKnowledgeGraph").mockImplementation(async (focus, depth) => mockGraphData);

        try {
            // Act 1: Default args
            const resDefault = await ctx.tools.executeTool("native.hub_knowledge_graph", {});

            // Assert 1
            expect(resDefault.status).toBe("success");
            expect(resDefault.result).toEqual({
                status: "success",
                data: mockGraphData
            });
            expect(spyGraph).toHaveBeenCalledWith("", 1);

            // Act 2: Custom args
            const resCustom = await ctx.tools.executeTool("native.hub_knowledge_graph", { focus: "src/main.ts", depth: 3 });

            // Assert 2
            expect(resCustom.status).toBe("success");
            expect(resCustom.result).toEqual({
                status: "success",
                data: mockGraphData
            });
            expect(spyGraph).toHaveBeenCalledWith("src/main.ts", 3);
        } finally {
            spyGraph.mockRestore();
        }
    });

    it("should handle error fallback in native.hub_knowledge_graph tool when getKnowledgeGraph throws", async () => {
        // Arrange
        await ctx.use(plugin);
        const hub = HubManagerGRPC.getInstance();
        const spyGraph = spyOn(hub, "getKnowledgeGraph").mockImplementation(async () => {
            throw new Error("gRPC Connection refused");
        });

        try {
            // Act
            const res = await ctx.tools.executeTool("native.hub_knowledge_graph", { focus: "test.ts" });

            // Assert
            expect(res.status).toBe("success");
            expect(res.result).toEqual({
                status: "fallback",
                error: "gRPC Connection refused",
                data: { nodes: [], edges: [], note: "Offline local graph used" }
            });
        } finally {
            spyGraph.mockRestore();
        }
    });
});
