import winston from "winston";
import { DSHHarnessBridge } from "../utils/ai/dsh_harness_bridge.ts";
import { ZvecGrepEngine } from "../utils/zvec/zvec_grep_engine.ts";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - DSHServer - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface DSHServerOptions {
    port?: number;
    hostname?: string;
    workspaceRoot?: string;
}

/**
 * 🐉 DSHServer
 *
 * Servidor HTTP/SSE nativo em Bun que expõe os endpoints compatíveis com o DeepSeek Harness (dsh)
 * e conecta a interface WinUI 3 às 8 Super Personas Soberanas, ZvecGrepEngine e Idris 2.
 */
export class DSHServer {
    private port: number;
    private hostname: string;
    private workspaceRoot: string;
    private bridge: DSHHarnessBridge;
    private serverInstance: any = null;

    constructor(options: DSHServerOptions = {}) {
        this.port = options.port || Number(process.env.DSH_PORT) || 3080;
        this.hostname = options.hostname || "127.0.0.1";
        this.workspaceRoot = options.workspaceRoot || process.cwd();
        this.bridge = DSHHarnessBridge.getInstance();
    }

    public start(): void {
        const bridge = this.bridge;
        const workspace = this.workspaceRoot;

        this.serverInstance = Bun.serve({
            port: this.port,
            hostname: this.hostname,
            async fetch(req) {
                const url = new URL(req.url);

                // CORS headers for WinUI 3 WebView2 and local dsh clients
                const headers = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                };

                if (req.method === "OPTIONS") {
                    return new Response(null, { headers });
                }

                // 1. Health Status Endpoint
                if (url.pathname === "/v1/status" || url.pathname === "/health") {
                    return Response.json({
                        status: "HEALTHY",
                        system: "Personas & Agentes — Sovereign Architecture 2.0",
                        harness: "DeepSeek Harness (DSH) Native Server",
                        activePersonas: 8,
                        workspace
                    }, { headers });
                }

                // 2. Models / Personas Catalog Endpoint
                if (url.pathname === "/v1/models") {
                    return Response.json({
                        object: "list",
                        data: [
                            { id: "strategic_cognitive_architect", name: "Strategic Cognitive Architect (AI/SLM)" },
                            { id: "audit_code_guardian", name: "Audit Code Guardian (Diagnostics)" },
                            { id: "security_cloud_guardian", name: "Security Cloud Guardian (Security)" },
                            { id: "architecture_types", name: "Architecture Types (AST)" },
                            { id: "resilience_healing_architect", name: "Resilience Healing Architect (Healing/Idris 2)" },
                            { id: "sys_perf_architect", name: "Sys Perf Architect (Governance/WASM)" },
                            { id: "sync_devops_architect", name: "Sync DevOps Architect (Automation)" },
                            { id: "ui_ux_architect", name: "UI/UX Architect (WinUI/DSH)" }
                        ]
                    }, { headers });
                }

                // 3. Search / RAG ZvecGrep Anchor Endpoint
                if (url.pathname === "/v1/search" && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const query = body?.query || "";
                        const zg = ZvecGrepEngine.getInstance(workspace);
                        const results = await zg.search(query, 5);
                        return Response.json({ query, results }, { headers });
                    } catch (e: any) {
                        return Response.json({ error: e.message }, { status: 500, headers });
                    }
                }

                // 4. MUX Chat Completions SSE Streaming Endpoint (DSH Protocol)
                if ((url.pathname === "/v1/chat/completions" || url.pathname === "/v1/stream") && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const prompt = body?.messages?.[body.messages.length - 1]?.content || body?.prompt || "";
                        const personaKey = body?.model || "strategic_cognitive_architect";

                        const session = bridge.createSession({
                            sessionId: crypto.randomUUID(),
                            workspaceRoot: workspace,
                            activePersonaKey: personaKey,
                            modelRoute: "unified_dual_api"
                        });

                        // Return SSE Stream
                        const stream = new ReadableStream({
                            async start(controller) {
                                const encoder = new TextEncoder();
                                try {
                                    for await (const chunk of bridge.streamChat(session.sessionId, prompt)) {
                                        const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
                                        controller.enqueue(encoder.encode(sseData));
                                    }
                                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                                    controller.close();
                                } catch (err: any) {
                                    const errData = `data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`;
                                    controller.enqueue(encoder.encode(errData));
                                    controller.close();
                                }
                            }
                        });

                        return new Response(stream, {
                            headers: {
                                ...headers,
                                "Content-Type": "text/event-stream",
                                "Cache-Control": "no-cache",
                                "Connection": "keep-alive"
                            }
                        });
                    } catch (e: any) {
                        return Response.json({ error: e.message }, { status: 500, headers });
                    }
                }

                return new Response("🏛️ DeepSeek Harness (DSH) Local Server Running", { headers });
            }
        });

        logger.info(`🐉 [DSH Server] Servidor DeepSeek Harness ativo em http://${this.hostname}:${this.port}`);
    }

    public stop(): void {
        if (this.serverInstance) {
            this.serverInstance.stop();
            this.serverInstance = null;
            logger.info("🔌 [DSH Server] Servidor encerrado.");
        }
    }
}
