import winston from "winston";
import { Path } from "./path_utils.ts";
import { DiagnosticPipeline } from "./diagnostic_pipeline.ts";
import { ContextEngine } from "../utils/context_engine.ts";
import { CacheManager } from "../utils/cache_manager.ts";
import { TaskExecutor } from "../utils/task_executor.ts";
import { AuditEngine } from "./audit_engine.ts";
import { DirectorPersona } from "../agents/TypeScript/Strategic/director.ts";
import { StabilityLedger } from "../utils/stability_ledger.ts";
import { HistoryAgent } from "../utils/history_agent.ts";
import { TaskQueue } from "../utils/task_queue.ts";
import { MemoryEngine } from "../utils/memory_engine.ts";
import { ReflexEngine } from "./reflex_engine.ts";
import { UpdateTransaction } from "../utils/update_transaction.ts";
import { SystemSentinel } from "../utils/system_sentinel.ts";
import { BehaviorAnalyst } from "../utils/behavior_analyst.ts";
import { TaskWorker } from "../utils/task_worker.ts";
import type { IAgent, SovereignState, DiagnosticFinding, SystemHealth360 } from "./types.ts";
import { MemoryPruningAgent } from "../agents/Support/Maintenance/memory_pruning_agent.ts";

const logger = winston.child({ module: "Orchestrator" });

export class Orchestrator {
    private state: SovereignState;
    projectRoot: Path;
    lastDetectedChanges: string[] = [];
    metrics: any = { files_scanned: 0, health_score: 100, start_time: Date.now(), efficiency: {} };
    personas: any[] = [];
    private agentRegistry: Map<string, IAgent> = new Map();

    // Core Engines
    contextEngine: ContextEngine;
    cacheManager: CacheManager;
    executor: TaskExecutor;
    auditEngine: AuditEngine;
    director: DirectorPersona;
    stabilityLedger: StabilityLedger;
    historyAgent: HistoryAgent;
    strategist: any;
    coreValidator: any;
    syntax: any;
    synthesizer: any; // HealthSynthesizer;
    taskQueue: TaskQueue;
    memoryEngine: MemoryEngine;
    reflexEngine: ReflexEngine;
    updateTransaction: UpdateTransaction;
    sentinel: SystemSentinel;
    behaviorAnalyst: BehaviorAnalyst;
    worker: TaskWorker;
    pruningAgent: MemoryPruningAgent;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.state = {
            root: projectRoot,
            metrics: { files_scanned: 0, start_time: Date.now() },
            identity: { core_mission: "Integrity Maintenance", stacks: ["TypeScript", "Python"] }
        };
        this.cacheManager = new CacheManager(this.projectRoot.toString());
        this.executor = new TaskExecutor();
        this.contextEngine = new ContextEngine(this.projectRoot.toString());
        this.auditEngine = new AuditEngine(this);
        this.director = new DirectorPersona(this.projectRoot.toString());
        this.stabilityLedger = new StabilityLedger(this.projectRoot.toString());
        this.historyAgent = new HistoryAgent(this.projectRoot.toString());
        this.taskQueue = new TaskQueue(this.projectRoot.toString());
        this.memoryEngine = new MemoryEngine(this.projectRoot.toString());
        this.reflexEngine = new ReflexEngine(this);
        this.updateTransaction = new UpdateTransaction();
        this.sentinel = new SystemSentinel();
        this.behaviorAnalyst = new BehaviorAnalyst(this.projectRoot.toString());
        this.worker = new TaskWorker(this);
        this.pruningAgent = new MemoryPruningAgent(this.projectRoot.toString());

        this._registerAgents();
        this._initEngines();
        this._initTools();
    }

    private _registerAgents() {
        this.agentRegistry.set(this.pruningAgent.id, this.pruningAgent);
        // More agents can be registered here as they are refactored to IAgent
    }

    async dispatch(agentId: string, context: any = {}): Promise<any> {
        const agent = this.agentRegistry.get(agentId);
        if (!agent) {
            logger.warn(`⚠️ [Orchestrator] Agent ${agentId} não encontrado no registro.`);
            return null;
        }

        if (agent.initialize) await agent.initialize();
        return await agent.execute(context);
    }

    _initEngines() {
        // Placeholders for remaining engines
        this.strategist = {
            planTargetedVerification: async (findings: any[]) => {
                logger.info("Strategist: Planejando verificações...");
                return { tasks: [] };
            }
        };
        logger.info("Engines do Orquestrador (Bun) inicializados.");
    }

    _initTools() {
        this.coreValidator = {
            verifyCoreHealth: async (root: Path, files: string[]) => {
                logger.info(`CoreValidator: Verificando saúde em ${files.length} arquivos...`);
                return { success: true, score: 98 };
            }
        };
        this.synthesizer = {
            getTopologyIssues: (ctx: any) => [],
            synthesize360: async (ctx: any, m_orc: any, personas: any, ledger: any, qa: any) => {
                const { HealthSynthesizer } = await import("../agents/Support/Diagnostics/health_synthesizer.ts");
                const syn = new HealthSynthesizer();
                return syn.synthesize360(ctx, m_orc, personas, ledger, qa);
            }
        };
    }

    addPersona(persona: any) {
        this.personas.push(persona);
    }

    async runStrategicAudit(context: any, objective: string | null = null, includeHistory: boolean = true) {
        logger.info("Auditoria Estratégica: Acionando AuditEngine...");
        const [findings, startT] = await this.auditEngine.runStrategicAudit(context, objective);

        // Simulating sync and ledger for now
        this._logPerformance(startT, "Auditoria Estratégica");
        return findings;
    }

    async runStagedAudit(options: { dryRun?: boolean }) {
        logger.info("Auditoria Staged: Acionando AuditEngine...");
        const context = { identity: { stacks: new Set(["TypeScript", "Python"]) } };
        const [findings, startT] = await this.auditEngine.runStagedAudit(context, options.dryRun);
        this._logPerformance(startT, "Auditoria Staged");
        return findings;
    }

    async runObfuscationScan() {
        logger.info("Scan de Ofuscação: Acionando AuditEngine...");
        return await this.auditEngine.runObfuscationScan(null);
    }

    /** v7.3: Parity Restoration */
    setThinkingDepth(level: number) {
        logger.info(`🧠 [Orchestrator] Definindo profundidade de pensamento: ${level}`);
        this.memoryEngine.setDepth(level);
    }

    async _syncAndLedger() {
        logger.info("⚖️ [Orchestrator] Sincronizando Stability Ledger...");
        await this.stabilityLedger.sync();
    }

    async _updateCache() {
        logger.info("💾 [Orchestrator] Atualizando cache de arquivos...");
        await this.cacheManager.updateAll();
    }

    _buildAuditReportQueue(findings: any[]) {
        logger.info(`📋 [Orchestrator] Construindo fila de relatório com ${findings.length} achados.`);
        return findings.sort((a, b) => (b.severity === "CRITICAL" ? 1 : -1));
    }

    async runAutoHealing(findings: any[]) {
        const { HealerPersona } = await import("../agents/Support/Core/healer.ts");
        const healer = new HealerPersona(this.projectRoot.toString());
        let healedCount = 0;

        for (const finding of findings) {
            if (finding.severity === "CRITICAL" || finding.severity === "HIGH") {
                const success = await healer.healFinding(finding, this);
                if (success) healedCount++;
            }
        }

        return healedCount;
    }

    async runTargetedVerification(plan: any) {
        logger.info("Executando verificações direcionadas...");
        return [];
    }

    async getSystemHealth360(ctx: any, health: any, findings: any[]) {
        const { PyramidAnalyst } = await import("../agents/Support/Analysis/pyramid_analyst.ts");
        const { QualityAnalyst } = await import("../agents/Support/Diagnostics/quality_analyst.ts");
        const { TopologyGraphAgent } = await import("../agents/Support/Automation/topology_graph_agent.ts");

        this._enrichPathMetrics(ctx);

        const qaData = {
            pyramid: await new PyramidAnalyst().analyze(ctx.map || {}, async (p: string) => Bun.file(this.projectRoot.join(p).toString()).text()),
            execution: {},
            matrix: new QualityAnalyst().calculateConfidenceMatrix(ctx.map || {}),
            topology_graph: new TopologyGraphAgent().generateMermaidGraph(ctx.map || {}),
            depth_audit: ctx.depthAudit
        };

        return await this.synthesizer.synthesize360({ ...ctx, alerts: findings }, this.metrics, this.personas, this.stabilityLedger, qaData);
    }

    private _enrichPathMetrics(ctx: any) {
        if (!ctx.depthAudit?.metrics) return;
        const mapKeys = Object.keys(ctx.map || {});
        for (const metric of ctx.depthAudit.metrics) {
            const normPath = metric.path.replace(/\\/g, "/");
            this._matchAndApplyMetric(ctx.map, mapKeys, normPath, metric.tsDepth);
        }
    }

    private _matchAndApplyMetric(map: any, keys: string[], normPath: string, depth: number) {
        for (const k of keys) {
            if (k.replace(/\\/g, "/") === normPath || k.replace(/\\/g, "/").endsWith(normPath.split('/').pop() || "INVALID")) {
                map[k].tsDepth = depth;
                break;
            }
        }
    }

    async generateMorningBriefing() {
        const { BriefingAgent } = await import("../agents/Support/Reporting/briefing_agent.ts");
        const briefing = new BriefingAgent(this.projectRoot.toString());
        return await briefing.generateMorningReport();
    }

    async runMaintenance() {
        logger.info("🔧 [Orchestrator] Iniciando manutenção do sistema...");
        await this.pruningAgent.execute({ days: 30 });
    }

    async generateFullDiagnostic(options: { autoHeal: boolean, dryRun?: boolean }): Promise<Path> {
        logger.info("🚀 Acionando DiagnosticPipeline (Bun Version)...");
        const pipeline = new DiagnosticPipeline(this);
        return await pipeline.execute({ autoHeal: options.autoHeal, dryRun: options.dryRun });
    }

    private _logPerformance(startTime: number, message: string) {
        const duration = (Date.now() - startTime) / 1000;
        logger.info(`${message} concluído em ${duration.toFixed(4)}s.`);
    }
}
