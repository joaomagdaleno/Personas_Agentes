import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin.ts";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc.ts";

/**
 * Component Under Test: src_local/psa/plugins/native/go_hub_plugin.ts
 * Layer: Native Plugins / Go Hub Proxy gRPC Bridge
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

    it("should verify Go Hub Proxy status via native.hub_status tool", async () => {
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
        expect(typeof resData.healthy).toBe("boolean");
        expect(resData.host).toBe("127.0.0.1:50051");
        expect(resData.transport).toBe("gRPC over HTTP/2");
        expect(resData.maxMessageBuffer).toBe("128 MB");
        expect(resData.circuitBreaker).toBe("ARMED");
    });

    it("should query sovereign knowledge graph via native.hub_knowledge_graph tool when Hub returns data or null", async () => {
        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", {});

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { status: string; data: any };
        expect(resData.status).toBe("success");
        expect(resData.data).toBeDefined();
        expect(Array.isArray(resData.data.nodes)).toBe(true);
        expect(Array.isArray(resData.data.edges)).toBe(true);
    });

    it("should query sovereign knowledge graph via native.hub_knowledge_graph tool with specific focus and depth", async () => {
        // Act
        const result = await ctx.tools.executeTool("native.hub_knowledge_graph", {
            focus: "src_local/psa/kernel/psa_events.ts",
            depth: 2
        });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { status: string; data: any };
        expect(resData.status).toBe("success");
        expect(resData.data).toBeDefined();
        expect(Array.isArray(resData.data.nodes)).toBe(true);
        expect(Array.isArray(resData.data.edges)).toBe(true);
    });

    it("should handle thrown errors gracefully with fallback payload in native.hub_knowledge_graph", async () => {
        // Arrange
        const hub = HubManagerGRPC.getInstance();
        const spy = spyOn(hub, "getKnowledgeGraph").mockImplementation(async () => {
            throw new Error("gRPC Connection Refused Test Error");
        });

        try {
            // Act
            const result = await ctx.tools.executeTool("native.hub_knowledge_graph", { focus: "test" });

            // Assert
            expect(result.status).toBe("success");
            const resData = result.result as { status: string; error: string; data: any };
            expect(resData.status).toBe("fallback");
            expect(resData.error).toBe("gRPC Connection Refused Test Error");
            expect(resData.data.note).toBe("Offline local graph used");
        } finally {
            spy.mockRestore();
        }
    });
});
