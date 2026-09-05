import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

/**
 * 🌐 GoHubPlugin
 *
 * Plugin nativo que encapsula o Go Hub Proxy gRPC (`src_native/hub/hub.exe`).
 * Fornece canal seguro de comunicação IPC com circuit breaker e buffers de até 128MB.
 */
export class GoHubPlugin implements PsaPlugin {
    public name = "native-go-hub";
    public version = "2.0.0";
    public description = "Bridge nativa gRPC com o Go Hub Proxy com circuit breaker e buffers elásticos.";

    public apply(ctx: PsaContext): void {
        // 1. Ferramenta de Status de Conexão com o Hub
        ctx.tools.register({
            name: "native.hub_status",
            description: "Verifica a saúde do Go Hub Proxy gRPC (porta 50051) e estatísticas de IPC.",
            schema: { type: "object", properties: {} },
            isExclusive: false,
            execute: async () => {
                const { HubManagerGRPC } = await import("../../../core/hub_manager_grpc.ts");
                const hub = HubManagerGRPC.getInstance();
                const healthy = await hub.isHealthy();

                return {
                    status: healthy ? "ONLINE" : "OFFLINE_DEGRADED",
                    healthy,
                    host: "127.0.0.1:50051",
                    transport: "gRPC over HTTP/2",
                    maxMessageBuffer: "128 MB",
                    circuitBreaker: "ARMED"
                };
            }
        });

        // 2. Consulta ao Grafo de Conhecimento Nativo (KnowledgeGraph)
        ctx.tools.register({
            name: "native.hub_knowledge_graph",
            description: "Consulta o grafo de dependências e conhecimento soberano no Go Hub.",
            schema: {
                type: "object",
                properties: {
                    focus: { type: "string", description: "Módulo ou arquivo alvo" },
                    depth: { type: "number", description: "Profundidade de nós no grafo (padrão: 1)" }
                }
            },
            isExclusive: false,
            execute: async (args: { focus?: string; depth?: number }) => {
                const { HubManagerGRPC } = await import("../../../core/hub_manager_grpc.ts");
                const hub = HubManagerGRPC.getInstance();

                try {
                    const data = await hub.getKnowledgeGraph(args.focus || "", args.depth || 1);
                    return {
                        status: "success",
                        data: data || { nodes: [], edges: [] }
                    };
                } catch (e: any) {
                    return {
                        status: "fallback",
                        error: e.message,
                        data: { nodes: [], edges: [], note: "Offline local graph used" }
                    };
                }
            }
        });
    }
}
