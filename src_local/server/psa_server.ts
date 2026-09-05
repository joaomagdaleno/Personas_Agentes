import winston from "winston";
import { PsaContext } from "../psa/kernel/psa_context.ts";
import { PsaAgentLoop } from "../psa/core/psa_agent_loop.ts";
import { ZvecGrepPlugin } from "../psa/plugins/core/zvec_grep_plugin.ts";
import { Idris2Plugin } from "../psa/plugins/core/idris2_plugin.ts";
import { FSPlugin } from "../psa/plugins/core/fs_plugin.ts";
import { ShellPlugin } from "../psa/plugins/core/shell_plugin.ts";
import { InteractionPlugin } from "../psa/plugins/core/interaction_plugin.ts";
import { CompactionPlugin } from "../psa/plugins/core/compaction_plugin.ts";
import { MCPPlugin } from "../psa/plugins/core/mcp_plugin.ts";
import { SubagentPlugin } from "../psa/plugins/core/subagent_plugin.ts";
import { TodoPlugin } from "../psa/plugins/core/todo_plugin.ts";
import { WebPlugin } from "../psa/plugins/core/web_plugin.ts";
import { SkillPlugin } from "../psa/plugins/core/skill_plugin.ts";
import { SqliteStoragePlugin } from "../psa/plugins/core/sqlite_storage_plugin.ts";
import { GithubWebhookPlugin } from "../psa/plugins/core/github_webhook_plugin.ts";
import { TerminalPtyPlugin } from "../psa/plugins/core/terminal_pty_plugin.ts";
import { LspPlugin } from "../psa/plugins/core/lsp_plugin.ts";
import { PsaSystemControlPlugin } from "../psa/plugins/core/system_control_plugin.ts";
import { ZigAnalyzerPlugin } from "../psa/plugins/native/zig_analyzer_plugin.ts";
import { GoHubPlugin } from "../psa/plugins/native/go_hub_plugin.ts";
import { RustSimdPlugin } from "../psa/plugins/native/rust_simd_plugin.ts";
import { mountAllSuperPersonaPlugins } from "../psa/plugins/personas/index.ts";
import { ZvecGrepEngine } from "../utils/zvec/zvec_grep_engine.ts";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - PSAServer - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface PsaServerOptions {
    port?: number;
    hostname?: string;
    workspaceRoot?: string;
}

/**
 * 🏛️ PsaServer
 *
 * Servidor HTTP/SSE nativo em Bun que implementa o micro-kernel do PSA (Personas & Agentes).
 * "Tudo é um Plugin": ferramentas, modelos, personas, verificação Idris 2, compactação,
 * clientes MCP e sessões são orquestrados através do PsaContext e despachados para a interface WinUI 3.
 */
export class PsaServer {
    private port: number;
    private hostname: string;
    private workspaceRoot: string;
    private ctx: PsaContext;
    private agentLoop: PsaAgentLoop;
    private serverInstance: any = null;

    constructor(options: PsaServerOptions = {}) {
        this.port = options.port || Number(process.env.PSA_PORT) || Number(process.env.DSH_PORT) || 3080;
        this.hostname = options.hostname || "127.0.0.1";
        this.workspaceRoot = options.workspaceRoot || process.cwd();

        // Inicializa o micro-kernel PSA
        this.ctx = PsaContext.getInstance(this.workspaceRoot);

        // Registra plugins centrais (Core)
        this.ctx.use(new ZvecGrepPlugin());
        this.ctx.use(new Idris2Plugin());
        this.ctx.use(new FSPlugin());
        this.ctx.use(new ShellPlugin());
        this.ctx.use(new InteractionPlugin());
        this.ctx.use(new CompactionPlugin());
        this.ctx.use(new MCPPlugin());
        this.ctx.use(new SubagentPlugin());
        this.ctx.use(new TodoPlugin());
        this.ctx.use(new WebPlugin());
        this.ctx.use(new SkillPlugin());
        this.ctx.use(new SqliteStoragePlugin());
        this.ctx.use(new GithubWebhookPlugin());
        this.ctx.use(new TerminalPtyPlugin());
        this.ctx.use(new LspPlugin());
        this.ctx.use(new PsaSystemControlPlugin());
        this.ctx.use(new ZigAnalyzerPlugin());
        this.ctx.use(new GoHubPlugin());
        this.ctx.use(new RustSimdPlugin());

        // Registra as 8 Super Personas como plugins
        mountAllSuperPersonaPlugins(this.ctx);

        // Inicializa o Agent Loop oficial do PSA
        this.agentLoop = new PsaAgentLoop(this.ctx);
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

                // CORS headers para WinUI 3 desktop e clientes locais
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
                        engine: "PSA Native Micro-Kernel Server",
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
                        { id: "ui_ux_architect", name: "UI/UX Architect (WinUI/PSA)", type: "persona" }
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

                // 4. Installed Plugins & Dynamic Hot-Reload
                if (url.pathname === "/v1/plugins" || url.pathname === "/api/plugins") {
                    const isDetailed = url.searchParams.get("detailed") === "true";
                    return Response.json({
                        object: "list",
                        total: ctx.plugins.list().length,
                        data: isDetailed ? ctx.plugins.listDetailed() : ctx.plugins.list()
                    }, { headers });
                }

                if ((url.pathname === "/v1/plugins/reload" || url.pathname === "/api/plugins/reload") && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const { name, path: pluginPath } = body || {};
                        if (!name || !pluginPath) {
                            return Response.json({ error: "Parâmetros 'name' e 'path' são obrigatórios para reload." }, { status: 400, headers });
                        }
                        const ok = await ctx.loader.reloadPlugin(name, pluginPath);
                        return Response.json({ success: ok, plugin: name }, { headers });
                    } catch (e: any) {
                        return Response.json({ error: e.message }, { status: 500, headers });
                    }
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

                // 6. PSA Sessions & Trajectory Retrieval
                if (url.pathname.startsWith("/v1/sessions")) {
                    const parts = url.pathname.split("/").filter(Boolean);
                    if (parts.length === 2 && req.method === "GET") {
                        return Response.json({ sessions: ctx.sessions.listSessions() }, { headers });
                    }
                    if (parts.length === 3 && req.method === "GET") {
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

                // 8. MUX Chat Completions SSE Streaming Endpoint (PSA Agent Loop Native)
                if ((url.pathname === "/v1/chat/completions" || url.pathname === "/v1/stream") && req.method === "POST") {
                    try {
                        const body = await req.json() as any;
                        const prompt = body?.messages?.[body.messages.length - 1]?.content || body?.prompt || "";
                        const modelChoice = body?.model || "deepseek-v4-flash";
                        const personaKey = body?.persona || "strategic_cognitive_architect";
                        const mode = body?.mode || "Standard";
                        const deepthink = Boolean(body?.deepthink || modelChoice === "deepseek-v4-pro");
                        const sessionId = body?.sessionId || `ses_${Date.now().toString(36)}`;

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

                return new Response("🏛️ Personas & Agentes (PSA) Native Micro-Kernel Running", { headers });
            }
        });

        logger.info(`🏛️ [PSA Server] Servidor Personas & Agentes ativo em http://${this.hostname}:${this.port}`);
    }

    public stop(): void {
        if (this.serverInstance) {
            this.serverInstance.stop();
            this.serverInstance = null;
            logger.info("🔌 [PSA Server] Servidor encerrado.");
        }
    }
}

// Compatibilidade
export { PsaServer as DSHServer };
