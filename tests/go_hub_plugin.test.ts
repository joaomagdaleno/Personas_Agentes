import { describe, it, expect, spyOn, beforeEach, afterEach } from "bun:test";
import { GoHubPlugin } from "../src_local/psa/plugins/native/go_hub_plugin";
import { PsaContext } from "../src_local/psa/kernel/psa_context";
import { HubManagerGRPC } from "../src_local/core/hub_manager_grpc";

describe("GoHubPlugin Unit Tests", () => {
    let ctx: PsaContext;
    let plugin: GoHubPlugin;

    beforeEach(() => {
        ctx = new PsaContext();
        plugin = new GoHubPlugin();
    });

    it("should provide valid metadata and register tools on apply", () => {
        // Arrange & Act
        plugin.apply(ctx);

        // Assert
        expect(plugin.name).toBe("native-go-hub");
        expect(plugin.version).toBe("2.0.0");
        expect(plugin.description).toContain("Go Hub Proxy");

        expect(ctx.tools.has("native.hub_status")).toBe(true);
        expect(ctx.tools.has("native.hub_knowledge_graph")).toBe(true);
    });

    describe("native.hub_status Tool Execution", () => {
        it("should return ONLINE status when Hub is healthy", async () => {
            // Arrange
            plugin.apply(ctx);

            const dummyHub = {
                isHealthy: async () => true
            } as any;

            const getInstanceSpy = spyOn(HubManagerGRPC, "getInstance").mockReturnValue(dummyHub);

            // Act
            const tool = ctx.tools.get("native.hub_status");
            const result = await tool?.execute({});

            // Assert
            expect(result).toBeDefined();
            expect(result.status).toBe("ONLINE");
            expect(result.healthy).toBe(true);
            expect(result.host).toBe("127.0.0.1:50051");
            expect(result.maxMessageBuffer).toBe("128 MB");

            getInstanceSpy.mockRestore();
        });

        it("should return OFFLINE_DEGRADED status when Hub is not healthy", async () => {
            // Arrange
            plugin.apply(ctx);

            const dummyHub = {
                isHealthy: async () => false
            } as any;

            const getInstanceSpy = spyOn(HubManagerGRPC, "getInstance").mockReturnValue(dummyHub);

            // Act
            const tool = ctx.tools.get("native.hub_status");
            const result = await tool?.execute({});

            // Assert
            expect(result).toBeDefined();
            expect(result.status).toBe("OFFLINE_DEGRADED");
            expect(result.healthy).toBe(false);

            getInstanceSpy.mockRestore();
        });
    });

    describe("native.hub_knowledge_graph Tool Execution", () => {
        it("should return knowledge graph data on success with explicit focus and depth", async () => {
            // Arrange
            plugin.apply(ctx);

            const graphMockData = {
                nodes: [{ id: "node1", label: "Core" }],
                edges: [{ source: "node1", target: "node2" }]
            };

            const dummyHub = {
                getKnowledgeGraph: async (focus: string, depth: number) => {
                    expect(focus).toBe("src/index.ts");
                    expect(depth).toBe(3);
                    return graphMockData;
                }
            } as any;

            const getInstanceSpy = spyOn(HubManagerGRPC, "getInstance").mockReturnValue(dummyHub);

            // Act
            const tool = ctx.tools.get("native.hub_knowledge_graph");
            const result = await tool?.execute({ focus: "src/index.ts", depth: 3 });

            // Assert
            expect(result.status).toBe("success");
            expect(result.data).toEqual(graphMockData);

            getInstanceSpy.mockRestore();
        });

        it("should fallback gracefully when getKnowledgeGraph throws an error", async () => {
            // Arrange
            plugin.apply(ctx);

            const dummyHub = {
                getKnowledgeGraph: async () => {
                    throw new Error("gRPC channel disconnected");
                }
            } as any;

            const getInstanceSpy = spyOn(HubManagerGRPC, "getInstance").mockReturnValue(dummyHub);

            // Act
            const tool = ctx.tools.get("native.hub_knowledge_graph");
            const result = await tool?.execute({});

            // Assert
            expect(result.status).toBe("fallback");
            expect(result.error).toBe("gRPC channel disconnected");
            expect(result.data).toEqual({
                nodes: [],
                edges: [],
                note: "Offline local graph used"
            });

            getInstanceSpy.mockRestore();
        });
    });
});
