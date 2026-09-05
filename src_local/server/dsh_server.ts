import winston from "winston";
import { DshContext } from "../dsh/kernel/dsh_context.ts";
import { DshAgentLoop } from "../dsh/core/dsh_agent_loop.ts";
import { ZvecGrepPlugin } from "../dsh/plugins/core/zvec_grep_plugin.ts";
import { Idris2Plugin } from "../dsh/plugins/core/idris2_plugin.ts";
import { FSPlugin } from "../dsh/plugins/core/fs_plugin.ts";
import { ShellPlugin } from "../dsh/plugins/core/shell_plugin.ts";
import { InteractionPlugin } from "../dsh/plugins/core/interaction_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../dsh/plugins/personas/index.ts";
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
 * Servidor HTTP/SSE nativo em Bun que implementa o micro-kernel do DeepSeek Harness (DSH).
 * "Tudo é um Plugin": ferramentas, modelos, personas, verificação Idris 2 e sessões
 * são orquestrados através do DshContext e despachados para a interface nativa WinUI 3.
 */
export class DSHServer {
    private port: number;
    private hostname: string;
    private workspaceRoot: string;
    private ctx: DshContext;
    private agentLoop: DshAgentLoop;
    private serverInstance: any = null;

    constructor(options: DSHServerOptions = {}) {
        this.port = options.port || Number(process.env.DSH_PORT) || 3080;
        this.hostname = options.hostname || "127.0.0.1";
        this.workspaceRoot = options.workspaceRoot || process.cwd();

        // Inicializa o micro-kernel DSH
        this.ctx = DshContext.getInstance(this.workspaceRoot);

        // Registra plugins centrais (Core)
        this.ctx.use(new ZvecGrepPlugin());
        this.ctx.use(new Idris2Plugin());
        this.ctx.use(new FSPlugin());
        this.ctx.use(new ShellPlugin());
        this.ctx.use(new InteractionPlugin());

        // Registra as 8 Super Personas como plugins
        mountAllSuperPersonaPlugins(this.ctx);

        // Inicializa o Agent Loop oficial do DSH
        this.agentLoop = new DshAgentLoop(this.ctx);
    }

    public start(): void {
        const ctx = this.ctx;
        const agentLoop = this.agentLoop;
        const workspace = this.workspaceRoot;

        this.serverInstance = Bun.serve({
            port: this.port,
            hostname: this.hostname,
            async fetch(req) {
                const url = new URL(req.url);

                // CORS headers for WinUI 3 native desktop app and local DSH clients
                const headers = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                };

                if (req.method === "OPTIONS") {
                    return new Response(null, { headers });
                }

                // 1. Health & Micro-Kernel Status
                if (url.pathname === "/v1/status" || url.pathname === "/health") {
                    return Response.json({
                        status: "HEALTHY",
                        system: "Personas & Agentes — Sovereign Architecture 2.0",
                        harness: "DeepSeek Harness (DSH) Native Micro-Kernel Server",
                        pluginsCount: ctx.plugins.list().length,
                        toolsCount: ctx.tools.list().length,
                        modelsCount: ctx.llm.list().length,
                        activePersonas: 8,
                        workspace
                    }, { headers });
                }

                // 2. Models & Personas Catalog
                if (url.pathname === "/v1/models") {
                    const llmModels = ctx.llm.list().map(m => ({
                        id: m.id,
                        name: m.name,
                        contextWindow: m.contextWindow,
                        supportsReasoning: m.supportsReasoning,
                        type: "model"
                    }));

                    const personas = [
                        { id: "strategic_cognitive_architect", name: "Strategic Cognitive Architect (AI/SLM)", type: "persona" },
                        { id: "audit_code_guardian", name: "Audit Code Guardian (Diagnostics)", type: "persona" },
                        { id: "security_cloud_guardian", name: "Security Cloud Guardian (Security)", type: "persona" },
                        { id: "architecture_types", name: "Architecture Types (AST)", type: "persona" },
                        { id: "resilience_healing_architect", name: "Resilience Healing Architect (Healing/Idris 2)", type: "persona" },
                        { id: "sys_perf_architect", name: "Sys Perf Architect (Governance/WASM)", type: "persona" },
                        { id: "sync_devops_architect", name: "Sync DevOps Architect (Automation)", type: "persona" },
                        { id: "ui_ux_architect", name: "UI/UX Architect (WinUI/DSH)", type: "persona" }
                    ];

                    return Response.json({
                        object: "list",
                        data: [...llmModels, ...personas]
                    }, { headers });
                }

                // 3. Registered Tools (Tudo é um Plugin)
                if (url.pathname === "/v1/tools") {
                    return Response.json({
                        object: "list",
                        data: ctx.tools.list()
                    }, { headers });
                }

                // 4. Installed Plugins
                if (url.pathname === "/v1/plugins") {
                    return Response.json({
                        object: "list",
                        data: ctx.plugins.list()
                    }, { headers });
                }

                // 5. Search / RAG ZvecGrep Engine Endpoint
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

                // 6. DSH Sessions & Trajectory Retrieval
                if (url.pathname.startsWith("/v1/sessions")) {
                    const parts = url.pathname.split("/").filter(Boolean);
                    if (parts.length === 2 && req.method === "GET") {
                        // /v1/sessions
                        return Response.json({ sessions: ctx.sessions.listSessions() }, { headers });
                    }
                    if (parts.length === 3 && req.method === "GET") {
                        // /v1/sessions/:id
                        const sessionId = parts[2];
                        const records = ctx.sessions.getTrajectory(sessionId);
                        return Response.json({ sessionId, records }, { headers });
                    }
                }

                // 7. Human-in-the-Loop Approval Endpoints
                if (url.pathname === "/v1/approval" && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const callId = body?.callId;
                        const approved = Boolean(body?.approved);
                        const resolved = ctx.approvals.resolveApproval(callId, approved);
                        return Response.json({ callId, resolved, approved }, { headers });
                    } catch (e: any) {
                        return Response.json({ error: e.message }, { status: 400, headers });
                    }
                }
                if (url.pathname === "/v1/approvals/pending" && req.method === "GET") {
                    return Response.json({ pending: ctx.approvals.getPending() }, { headers });
                }

                // 8. MUX Chat Completions SSE Streaming Endpoint (DSH Agent Loop Native)
                if ((url.pathname === "/v1/chat/completions" || url.pathname === "/v1/stream") && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const prompt = body?.messages?.[body.messages.length - 1]?.content || body?.prompt || "";
                        const modelChoice = body?.model || "deepseek-v4-flash";
                        const personaKey = body?.persona || "strategic_cognitive_architect";
                        const mode = body?.mode || "Standard";
                        const deepthink = Boolean(body?.deepthink || modelChoice === "deepseek-v4-pro");
                        const sessionId = body?.sessionId || `ses_${Date.now().toString(36)}`;

                        // Retorna SSE Stream acionado pelo DshAgentLoop
                        const stream = new ReadableStream({
                            async start(controller) {
                                const encoder = new TextEncoder();
                                try {
                                    for await (const event of agentLoop.runTurn({
                                        sessionId,
                                        prompt,
                                        model: modelChoice,
                                        mode,
                                        persona: personaKey,
                                        deepthink
                                    })) {
                                        const sseData = `data: ${JSON.stringify(event)}\n\n`;
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

                return new Response("🏛️ DeepSeek Harness (DSH) Native Micro-Kernel Running", { headers });
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
