import { PsaEventBus } from "./psa_events.ts";
import { PsaPluginManager, type PsaPlugin } from "./psa_plugin.ts";
import { PsaToolService } from "../tools/psa_tool_service.ts";
import { PsaSessionService } from "../session/psa_session_service.ts";
import { PsaLLMService } from "../llm/psa_llm_service.ts";
import { PsaTelemetryService } from "../telemetry/psa_telemetry_service.ts";
import { PsaApprovalManager } from "./psa_approval_manager.ts";
import { PsaPluginLoader } from "./psa_plugin_loader.ts";

/**
 * 🏛️ PsaContext (Micro-Kernel Soberano do Personas & Agentes)
 *
 * O container central onde tudo é registrado e injetado:
 * - `ctx.events`: Barramento de eventos e hooks de waterfall
 * - `ctx.plugins`: Gerenciador de ciclo de vida de plugins
 * - `ctx.loader`: Carregador e hot-reload dinâmico de plugins
 * - `ctx.tools`: Registro e despacho de ferramentas
 * - `ctx.sessions`: Log de sessões duráveis append-only (.psa_sessions)
 * - `ctx.llm`: Adaptador e catálogo de modelos DeepSeek V4
 * - `ctx.telemetry`: Métricas de performance e taxa de tokens
 * - `ctx.approvals`: Gestor de autorizações Human-in-the-Loop
 */
export class PsaContext {
    private static instance: PsaContext;

    public events: PsaEventBus;
    public plugins: PsaPluginManager;
    public loader: PsaPluginLoader;
    public tools: PsaToolService;
    public sessions: PsaSessionService;
    public llm: PsaLLMService;
    public telemetry: PsaTelemetryService;
    public approvals: PsaApprovalManager;
    public workspaceRoot: string;

    constructor(workspaceRoot?: string) {
        this.workspaceRoot = workspaceRoot || process.cwd();
        this.events = new PsaEventBus();
        this.plugins = new PsaPluginManager(this);
        this.loader = new PsaPluginLoader(this);
        this.tools = new PsaToolService(this);
        this.sessions = new PsaSessionService(this);
        this.llm = new PsaLLMService(this);
        this.telemetry = new PsaTelemetryService(this);
        this.approvals = new PsaApprovalManager();
    }

    public static getInstance(workspaceRoot?: string): PsaContext {
        if (!PsaContext.instance) {
            PsaContext.instance = new PsaContext(workspaceRoot);
        }
        return PsaContext.instance;
    }

    public static resetInstance(): void {
        PsaContext.instance = undefined as any;
    }

    private services: Map<string, any> = new Map();

    public registerService<T>(name: string, service: T): this {
        this.services.set(name, service);
        return this;
    }

    public getService<T>(name: string): T | undefined {
        return this.services.get(name);
    }

    public hasService(name: string): boolean {
        return this.services.has(name);
    }

    public listServices(): string[] {
        return Array.from(this.services.keys());
    }

    /**
     * Atalho para registrar um ou mais plugins no micro-kernel
     */
    public async use(plugin: PsaPlugin): Promise<this> {
        await this.plugins.register(plugin);
        return this;
    }

    /**
     * Carrega automaticamente todos os plugins contidos no diretório nativo/core/personas
     */
    public async loadBuiltinPlugins(): Promise<void> {
        const { default: pathModule } = await import("node:path");
        const pluginsDir = pathModule.resolve(this.workspaceRoot, "src_local/psa/plugins");
        await this.loader.loadFromDirectory(pluginsDir);
    }
}

// Compatibilidade
export { PsaContext as DshContext };
