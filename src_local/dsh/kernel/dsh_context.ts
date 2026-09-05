import { DshEventBus } from "./dsh_events.ts";
import { DshPluginManager, type DshPlugin } from "./dsh_plugin.ts";
import { DshToolService } from "../tools/dsh_tool_service.ts";
import { DshSessionService } from "../session/dsh_session_service.ts";
import { DshLLMService } from "../llm/dsh_llm_service.ts";
import { DshTelemetryService } from "../telemetry/dsh_telemetry_service.ts";

import { DshApprovalManager } from "./dsh_approval_manager.ts";

/**
 * 🐉 DshContext (Micro-Kernel do DeepSeek Harness)
 *
 * O container central onde tudo é registrado e injetado:
 * - `ctx.events`: Barramento de eventos e hooks de waterfall
 * - `ctx.plugins`: Gerenciador de ciclo de vida de plugins
 * - `ctx.tools`: Registro e despacho de ferramentas
 * - `ctx.sessions`: Log de sessões duráveis append-only
 * - `ctx.llm`: Adaptador e catálogo de modelos DeepSeek V4
 * - `ctx.telemetry`: Métricas de performance ao vivo
 * - `ctx.approvals`: Gestor de autorizações Human-in-the-Loop
 */
export class DshContext {
    private static instance: DshContext;

    public events: DshEventBus;
    public plugins: DshPluginManager;
    public tools: DshToolService;
    public sessions: DshSessionService;
    public llm: DshLLMService;
    public telemetry: DshTelemetryService;
    public approvals: DshApprovalManager;
    public workspaceRoot: string;

    constructor(workspaceRoot?: string) {
        this.workspaceRoot = workspaceRoot || process.cwd();
        this.events = new DshEventBus();
        this.plugins = new DshPluginManager(this);
        this.tools = new DshToolService(this);
        this.sessions = new DshSessionService(this);
        this.llm = new DshLLMService(this);
        this.telemetry = new DshTelemetryService(this);
        this.approvals = new DshApprovalManager();
    }

    public static getInstance(workspaceRoot?: string): DshContext {
        if (!DshContext.instance) {
            DshContext.instance = new DshContext(workspaceRoot);
        }
        return DshContext.instance;
    }

    /**
     * Atalho para registrar um ou mais plugins no micro-kernel
     */
    public async use(plugin: DshPlugin): Promise<this> {
        await this.plugins.register(plugin);
        return this;
    }
}
