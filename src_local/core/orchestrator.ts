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
import { CoreValidator } from "./validator.ts";
import { DiagnosticStrategist } from "../agents/Support/Diagnostics/diagnostic_strategist.ts";
import { UpdateTransaction } from "../utils/update_transaction.ts";
import { SystemSentinel } from "../utils/system_sentinel.ts";
import { BehaviorAnalyst } from "../utils/behavior_analyst.ts";
import { TaskWorker } from "../utils/task_worker.ts";
import type { IAgent, SovereignState } from "./types.ts";
import { MemoryPruningAgent } from "../agents/Support/Maintenance/memory_pruning_agent.ts";
import { PredictorEngine } from "../utils/ai/predictor_engine.ts";

const logger = winston.child({ module: "Orchestrator" });

export class Orchestrator {
    private state: SovereignState;
    projectRoot: Path;
    lastDetectedChanges: string[] = [];
    metrics: any = { files_scanned: 0, health_score: 100, start_time: Date.now(), efficiency: {} };
    personas: any[] = [];
    private agentRegistry: Map<string, IAgent> = new Map();

    // Core Engines
    contextEngine!: ContextEngine;
    cacheManager!: CacheManager;
    executor!: TaskExecutor;
    auditEngine!: AuditEngine;
    director!: DirectorPersona;
    stabilityLedger!: StabilityLedger;
    historyAgent!: HistoryAgent;
    strategist: any;
    coreValidator: any;
    synthesizer: any;
    taskQueue!: TaskQueue;
    memoryEngine!: MemoryEngine;
    reflexEngine!: ReflexEngine;
    updateTransaction!: UpdateTransaction;
    sentinel!: SystemSentinel;
    behaviorAnalyst!: BehaviorAnalyst;
    worker!: TaskWorker;
    pruningAgent!: MemoryPruningAgent;
    predictorEngine!: PredictorEngine;

    public ready: Promise<void>;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.state = {
            root: projectRoot,
            metrics: { files_scanned: 0, start_time: Date.now() },
            identity: { core_mission: "Integrity Maintenance", stacks: ["TypeScript", "Python"] }
        };
        this.initializeEngines(projectRoot);
        this._registerAgents();
        this._initEngines();
        this._initTools();

        this.ready = this._initNativeInfrastructure(projectRoot);
    }

    private async _initNativeInfrastructure(projectRoot: string): Promise<void> {
        try {
            const assemblerPath = "../agents/Support/Automation/infrastructure_assembler.ts";
            const m = await import(assemblerPath);
            console.log("🛠️ [Orchestrator] Carregando Infraestrutura Nativa...");
            await m.InfrastructureAssembler.launchSovereignAPI(projectRoot);
            await this._waitForHub();
        } catch (err: any) {
            console.error(`❌ [Orchestrator] Erro ao carregar infrastructure_assembler: ${err.message}`);
        }
    }

    private async _waitForHub(retries = 5) {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch("http://localhost:8080/status");
                if (res.ok) {
                    console.log("✅ [Orchestrator] Native Sovereign Hub conectado.");
                    return;
                }
            } catch (e) { }
            console.log(`⏳ [Orchestrator] Aguardando Hub (${i + 1}/${retries})...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    private initializeEngines(root: string) {
        this.cacheManager = new CacheManager(root);
        this.executor = new TaskExecutor();
        this.contextEngine = new ContextEngine(root);
        this.auditEngine = new AuditEngine(this);
        this.director = new DirectorPersona(root);
        this.stabilityLedger = new StabilityLedger(root);
        this.historyAgent = new HistoryAgent(root);
        this.taskQueue = new TaskQueue(root);
        this.memoryEngine = new MemoryEngine(root);
        this.reflexEngine = new ReflexEngine(this);
        this.updateTransaction = new UpdateTransaction();
        this.sentinel = new SystemSentinel();
        this.behaviorAnalyst = new BehaviorAnalyst(root);
        this.worker = new TaskWorker(this);
        this.pruningAgent = new MemoryPruningAgent(root);
        this.predictorEngine = new PredictorEngine(root);
    }

    private _registerAgents() {
        this.agentRegistry.set(this.pruningAgent.id, this.pruningAgent);
    }

    async dispatch(agentId: string, context: any = {}): Promise<any> {
        const agent = this.agentRegistry.get(agentId);
        if (!agent) {
            logger.warn(`⚠️ [Orchestrator] Agent ${agentId} não encontrado.`);
            return null;
        }

        if (agent.initialize) await agent.initialize();
        return await agent.execute(context);
    }

    recordSystemEvent(eventName: string): void {
        this.predictorEngine.recordEvent(eventName);
    }

    _initEngines() {
        this.strategist = new DiagnosticStrategist();
        logger.info("Engines do Orquestrador (Bun) inicializados.");
    }

    _initTools() {
        this.coreValidator = new CoreValidator(this);
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

        const results = await Promise.all(findings.map(f => this.healSingleFinding(healer, f)));
        return results.filter(Boolean).length;
    }

    private async healSingleFinding(healer: any, finding: any): Promise<boolean> {
        if (this.isHighPriority(finding)) {
            return await healer.healFinding(finding, this);
        }
        return false;
    }

    private isHighPriority(finding: any): boolean {
        return finding.severity === "CRITICAL" || finding.severity === "HIGH";
    }

    async runTargetedVerification(plan: any) {
        logger.info("Executando verificações direcionadas...");
        return [];
    }

    async getSystemHealth360(ctx: any, health: any, findings: any[]) {
        this._enrichPathMetrics(ctx);
        const qaData = await this.collectQAData(ctx);

        return await this.synthesizer.synthesize360(
            { ...ctx, alerts: findings, predictor_metrics: this.predictorEngine.getSanityMetrics() },
            this.metrics,
            this.personas,
            this.stabilityLedger,
            qaData
        );
    }

    private async collectQAData(ctx: any) {
        const { PyramidAnalyst } = await import("../agents/Support/Analysis/pyramid_analyst.ts");
        const { QualityAnalyst } = await import("../agents/Support/Diagnostics/quality_analyst.ts");
        const { TopologyGraphAgent } = await import("../agents/Support/Automation/topology_graph_agent.ts");

        return {
            pyramid: await new PyramidAnalyst().analyze(ctx.map || {}, async (p: string) => Bun.file(this.projectRoot.join(p).toString()).text()),
            execution: {},
            matrix: new QualityAnalyst().calculateConfidenceMatrix(ctx.map || {}),
            topology_graph: new TopologyGraphAgent().generateMermaidGraph(ctx.map || {}),
            depth_audit: ctx.depthAudit
        };
    }

    private _enrichPathMetrics(ctx: any) {
        if (!ctx.depthAudit?.metrics) return;
        const mapKeys = Object.keys(ctx.map || {});
        ctx.depthAudit.metrics.forEach((metric: any) => this.applyMetricToMap(ctx.map, mapKeys, metric));
    }

    private applyMetricToMap(map: any, mapKeys: string[], metric: any) {
        const normPath = metric.path.replace(/\\/g, "/");
        const match = mapKeys.find(k => this.isPathMatch(k, normPath));
        if (match) {
            map[match].tsDepth = metric.tsDepth;
        }
    }

    private isPathMatch(key: string, normPath: string): boolean {
        const kNorm = key.replace(/\\/g, "/");
        return kNorm === normPath || kNorm.endsWith(normPath.split('/').pop() || "INVALID");
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
