import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin.ts";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc.ts";

/**
 * Component Under Test: src_local/psa/plugins/native/go_hub_plugin.ts
 * Layer: Native Plugins / Go gRPC Hub Proxy Bridge
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("GoHubPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const plugin = new GoHubPlugin();
        plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register native.hub_status and native.hub_knowledge_graph tools in PsaContext", () => {
        // Arrange & Act
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("native.hub_status");
        expect(toolNames).toContain("native.hub_knowledge_graph");
    });

    it("should execute native.hub_status tool and return connectivity metrics when Hub is offline/degraded", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const isHealthySpy = spyOn(hub, "isHealthy").mockResolvedValue(false);

        // Act
        const result = await ctx.tools.executeTool("native.hub_status", {});

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as {
            status: string;
            healthy: boolean;
            host: string;
            transport: string;
            maxMessageBuffer: string;
            circuitBreaker: string;
        };
        expect(resData.status).toBe("OFFLINE_DEGRADED");
        expect(resData.healthy).toBe(false);
        expect(resData.host).toBe("127.0.0.1:50051");
        expect(resData.transport).toBe("gRPC over HTTP/2");
        expect(resData.maxMessageBuffer).toBe("128 MB");
        expect(resData.circuitBreaker).toBe("ARMED");

        isHealthySpy.mockRestore();
    });

    it("should execute native.hub_status tool and return ONLINE status when Hub is healthy", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const isHealthySpy = spyOn(hub, "isHealthy").mockResolvedValue(true);

        // Act
        const result = await ctx.tools.executeTool("native.hub_status", {});

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { status: string; healthy: boolean };
        expect(resData.status).toBe("ONLINE");
        expect(resData.healthy).toBe(true);

        isHealthySpy.mockRestore();
    });

    it("should query native.hub_knowledge_graph tool with default parameters", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const mockGraph = { nodes: [{ id: "root" }], edges: [] };
        const graphSpy = spyOn(hub, "getKnowledgeGraph").mockResolvedValue(mockGraph);

        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", {});

        // Assert
        expect(result.status).toBe("success");
        expect(graphSpy).toHaveBeenCalledWith("", 1);
        const resData = result.result as { status: string; data: typeof mockGraph };
        expect(resData.status).toBe("success");
        expect(resData.data).toEqual(mockGraph);

        graphSpy.mockRestore();
    });

    it("should query native.hub_knowledge_graph tool with custom focus and depth parameters", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const mockGraph = { nodes: [{ id: "src_local/core" }], edges: [] };
        const graphSpy = spyOn(hub, "getKnowledgeGraph").mockResolvedValue(mockGraph);

        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", {
            focus: "src_local/core",
            depth: 3
        });

        // Assert
        expect(result.status).toBe("success");
        expect(graphSpy).toHaveBeenCalledWith("src_local/core", 3);
        const resData = result.result as { status: string; data: typeof mockGraph };
        expect(resData.status).toBe("success");
        expect(resData.data).toEqual(mockGraph);

        graphSpy.mockRestore();
    });

    it("should handle null response from HubManagerGRPC.getKnowledgeGraph gracefully", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const graphSpy = spyOn(hub, "getKnowledgeGraph").mockResolvedValue(null);

        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", {});

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { status: string; data: { nodes: any[]; edges: any[] } };
        expect(resData.status).toBe("success");
        expect(resData.data).toEqual({ nodes: [], edges: [] });

        graphSpy.mockRestore();
    });

    it("should catch errors thrown by HubManagerGRPC.getKnowledgeGraph and return fallback payload", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const graphSpy = spyOn(hub, "getKnowledgeGraph").mockRejectedValue(new Error("gRPC Connection Refused"));

        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", { focus: "invalid" });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as {
            status: string;
            error: string;
            data: { nodes: any[]; edges: any[]; note: string };
        };
        expect(resData.status).toBe("fallback");
        expect(resData.error).toBe("gRPC Connection Refused");
        expect(resData.data.note).toBe("Offline local graph used");

        graphSpy.mockRestore();
    });
});
