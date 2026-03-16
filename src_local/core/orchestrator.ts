import winston from "winston";
import { Path } from "./path_utils.ts";
import { DiagnosticPipeline } from "./diagnostic_pipeline.ts";
import { ContextEngine } from "../utils/context_engine.ts";
import { CacheManager } from "../utils/cache_manager.ts";
import { TaskExecutor } from "../utils/task_executor.ts";
import { AuditEngine } from "./audit_engine.ts";
import { DirectorPersona } from "../agents/Support/Strategic/director.ts";
import { StabilityLedger } from "../utils/stability_ledger.ts";
import { HistoryAgent } from "../utils/history_agent.ts";
import { TaskQueue } from "../utils/task_queue.ts";
import { MemoryEngine } from "../utils/memory_engine.ts";
import { ReflexEngine } from "./reflex_engine.ts";
import { eventBus } from "./event_bus.ts";
import { CoreValidator } from "./validator.ts";
import { DiagnosticStrategist } from "../agents/Support/Diagnostics/diagnostic_strategist.ts";
import { UpdateTransaction } from "../utils/update_transaction.ts";
import { SystemSentinel } from "../utils/system_sentinel.ts";
import { BehaviorAnalyst } from "../utils/behavior_analyst.ts";
import { TaskWorker } from "../utils/task_worker.ts";
import { MemoryPruningAgent } from "../agents/Support/Maintenance/memory_pruning_agent.ts";
import { PredictorEngine } from "../utils/ai/predictor_engine.ts";
import { HubWatcher } from "../utils/hub_watcher.ts";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";
import { RegistryManager } from "./registry_manager.ts";
import { ParityDaemon } from "./parity_daemon.ts";
import { QAEngineerPersona } from "../agents/Support/Diagnostics/qa_engineer.ts";
import { PhdGovernanceSystem } from "../core/governance/system_facade.ts";
import { DocGenAgent } from "../agents/Support/Automation/doc_gen_agent.ts";
import type { IAgent, ProjectContext, GenericFinding, SystemHealth360, SystemMetrics, IHealthSynthesizer, AnalysisResult } from "./types.ts";

const logger = winston.child({ module: "Orchestrator" });

export class Orchestrator {
    projectRoot: Path;
    lastDetectedChanges: string[] = [];
    metrics: SystemMetrics;
    personas: IAgent[] = [];
    private agentRegistry: Map<string, IAgent> = new Map();

    // Core Engines
    contextEngine!: ContextEngine;
    cacheManager!: CacheManager;
    executor!: TaskExecutor;
    auditEngine!: AuditEngine;
    director!: DirectorPersona;
    stabilityLedger!: StabilityLedger;
    historyAgent!: HistoryAgent;
    strategist!: DiagnosticStrategist;
    coreValidator!: CoreValidator;
    synthesizer!: IHealthSynthesizer;
    taskQueue!: TaskQueue;
    memoryEngine!: MemoryEngine;
    reflexEngine!: ReflexEngine;
    updateTransaction!: UpdateTransaction;
    sentinel!: SystemSentinel;
    behaviorAnalyst!: BehaviorAnalyst;
    worker!: TaskWorker;
    pruningAgent!: MemoryPruningAgent;
    predictorEngine!: PredictorEngine;
    hubWatcher!: HubWatcher;
    hubManager!: HubManagerGRPC;
    registryManager!: RegistryManager;
    qaEngineer!: QAEngineerPersona;
    parityDaemon!: ParityDaemon;
    docGen!: DocGenAgent;
    private governance: PhdGovernanceSystem;

    public ready: Promise<void>;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.metrics = {
            files_scanned: 0,
            health_score: 100,
            start_time: Date.now(),
            efficiency: {}
        };
        this.hubManager = HubManagerGRPC.getInstance();
        this.registryManager = new RegistryManager(projectRoot);
        this.governance = PhdGovernanceSystem.getInstance(); // Initialize governance here
        this.docGen = new DocGenAgent();
        this.initializeEngines(projectRoot);
        this._registerAgents();
        this._initEngines();
        this._initTools();
        this._registerEventListeners();
        
        const gov = PhdGovernanceSystem.getInstance();
        const load = gov.getCurrentLoad();
        logger.info(`🌐 [Sovereign Governance] Consciência de Setup iniciada: ${load.cpuCores} Cores | ${load.totalMemoryGb.toFixed(2)}GB RAM Total | Livres: ${load.freeMemoryGb.toFixed(2)}GB.`);

        this.ready = this._initNativeInfrastructure(projectRoot);
    }

    /**
     * Registers event listeners on the global Event Bus.
     * This is the Orchestrator's side of the Mediator pattern.
     */
    private _registerEventListeners(): void {
        eventBus.on("system:halt-experimentation", () => {
            logger.warn("🚨 [Orchestrator] Recebido evento de emergência. Travando experimentações...");
            for (const persona of this.personas) {
                if ('haltExperimentation' in persona && typeof (persona as any).haltExperimentation === 'function') {
                    (persona as any).haltExperimentation();
                }
            }
        });
    }

    private async _initNativeInfrastructure(projectRoot: string): Promise<void> {
        try {
            const { SystemManager } = await import("./system_manager.ts");
            const sm = SystemManager.getInstance();
            
            logger.info("🛠️ [Orchestrator] Inicializando Ciclo de Vida do Sistema...");
            const ready = await sm.ensureInfrastructure(projectRoot);
            
            if (!ready) {
                logger.warn("⚠️ [Orchestrator] Infraestrutura nativa não está 100% pronta. Operando em modo degradado.");
            }

            await this._waitForHub();

            this.hubWatcher = new HubWatcher();
            this.hubWatcher.onChange(async (p) => {
                console.log(`📡 [Orchestrator] Auditando mudança detectada em: ${p}`);
                this.lastDetectedChanges.push(p);
                // Trigger auto-refresh
                await this._updateCache();
                await this.runStagedAudit({ dryRun: false });
            });
            this.hubWatcher.start();

            this.parityDaemon = new ParityDaemon(projectRoot, this.hubWatcher, this.stabilityLedger, this.hubManager);
            this.parityDaemon.start();
        } catch (err: any) {
            console.error(`❌ [Orchestrator] Erro ao carregar infrastructure_assembler: ${err.message}`);
        }
    }

    private async _waitForHub(retries = 5) {
        for (let i = 0; i < retries; i++) {
            if (await this.hubManager.isHealthy()) {
                console.log("✅ [Orchestrator] Native Sovereign Hub (gRPC) conectado.");
                return;
            }
            console.log(`⏳ [Orchestrator] Aguardando Hub gRPC (${i + 1}/${retries})...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    private initializeEngines(root: string) {
        this.cacheManager = new CacheManager(root);
        this.executor = new TaskExecutor();
        this.contextEngine = new ContextEngine(root, this.hubManager);
        this.auditEngine = new AuditEngine(this);
        this.director = new DirectorPersona(root);
        this.stabilityLedger = new StabilityLedger(root);
        this.historyAgent = new HistoryAgent(root);
        this.taskQueue = new TaskQueue(root);
        this.memoryEngine = new MemoryEngine(root, this.hubManager);
        this.reflexEngine = new ReflexEngine();
        this.updateTransaction = new UpdateTransaction();
        this.sentinel = new SystemSentinel();
        this.behaviorAnalyst = new BehaviorAnalyst(root);
        this.worker = new TaskWorker(this.taskQueue, this);
        this.pruningAgent = new MemoryPruningAgent(root);
        this.predictorEngine = new PredictorEngine(root);
        this.qaEngineer = new QAEngineerPersona(root.toString());
    }

    private _registerAgents() {
        this.agentRegistry.set(this.pruningAgent.id, this.pruningAgent as unknown as IAgent);
        this.agentRegistry.set(this.qaEngineer.id, this.qaEngineer as unknown as IAgent);
    }

    async dispatch(agentId: string, context: ProjectContext = {}): Promise<any> {
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
            synthesize360: async (ctx: ProjectContext, m_orc: SystemMetrics, personas: IAgent[], ledger: StabilityLedger, qa: any) => {
                const { HealthSynthesizer } = await import("../agents/Support/Diagnostics/health_synthesizer.ts");
                const syn = new HealthSynthesizer(this.hubManager);
                return syn.synthesize360(ctx, m_orc, personas, ledger, qa);
            }
        };
    }

    addPersona(persona: IAgent) {
        this.personas.push(persona);
        this.agentRegistry.set(persona.id, persona);
    }

    async runStrategicAudit(context: ProjectContext, objective: string | null = null, _includeHistory: boolean = true): Promise<GenericFinding[]> {
        logger.info("Auditoria Estratégica: Acionando AuditEngine...");
        const [findings, startT] = await this.auditEngine.runStrategicAudit(context, objective);
        this._logPerformance(startT, "Auditoria Estratégica");
        return findings;
    }

    async runStagedAudit(options: { dryRun?: boolean }): Promise<GenericFinding[]> {
        logger.info("Auditoria Staged: Acionando AuditEngine...");
        const context: ProjectContext = { identity: { stacks: new Set(["TypeScript", "Python"]) } };
        const [findings, startT] = await this.auditEngine.runStagedAudit(context, options.dryRun);
        this._logPerformance(startT, "Auditoria Staged");
        return findings;
    }

    async runObfuscationScan(): Promise<GenericFinding[]> {
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

    _buildAuditReportQueue(findings: GenericFinding[]): GenericFinding[] {
        logger.info(`📋 [Orchestrator] Construindo fila de relatório com ${findings.length} achados.`);
        return findings.sort((_a, b) => (b.severity === "CRITICAL" ? 1 : -1));
    }

    async runAutoHealing(findings: GenericFinding[]): Promise<number> {
        const { HealerPersona } = await import("../agents/Support/Core/healer.ts");
        const healer = new HealerPersona(this.projectRoot.toString());

        const results = await Promise.all(findings.map(f => this.healSingleFinding(healer, f)));
        return results.filter(Boolean).length;
    }

    private async healSingleFinding(healer: any, finding: GenericFinding): Promise<boolean> {
        if (this.isHighPriority(finding)) {
            return await healer.healFinding(finding, this);
        }
        return false;
    }

    /**
     * Gera testes de alta fidelidade para um arquivo e valida a execução.
     */
    async generateTests(filePath: string): Promise<boolean> {
        logger.info(`🧪 [Orchestrator] Solicitando geração de testes PhD para: ${filePath}`);
        const success = await this.qaEngineer.generateUnitTest(filePath, this);
        
        if (success) {
            const testFilePath = filePath.replace(/\.ts$/, '.test.ts');
            logger.info(`🧪 [Orchestrator] Validando execução do teste: ${testFilePath}`);
            
            const verifyResult = await this.verifyTest(testFilePath);
            if (!verifyResult.success) {
                logger.warn(`🧪 [Orchestrator] Teste gerado falhou na validação. Iniciando Auto-Healing...`);
                return await this.autoHealTest(filePath, testFilePath, verifyResult.output);
            }
            logger.info(`✅ [Orchestrator] Teste validado com sucesso: ${testFilePath}`);
            return true;
        }
        
        return false;
    }

    /**
     * Gera testes de integração entre dois módulos.
     */
    async generateIntegrationTest(fileA: string, fileB: string): Promise<boolean> {
        logger.info(`🔗 [Orchestrator] Solicitando teste de INTEGRAÇÃO: ${fileA} <-> ${fileB}`);
        const success = await this.qaEngineer.generateIntegrationTest(fileA, fileB, this);
        
        if (success) {
            const testFilePath = fileA.replace(/\.ts$/, '.integration.test.ts');
            const verifyResult = await this.verifyTest(testFilePath);
            if (!verifyResult.success) {
                logger.warn(`🔗 [Orchestrator] Teste de integração falhou. Trazendo Healer...`);
                return await this.autoHealTest(fileA, testFilePath, verifyResult.output);
            }
            return true;
        }
        return false;
    }

    /**
     * Gera testes E2E (End-to-End) para um fluxo crítico.
     */
    async generateE2ETest(filePath: string): Promise<boolean> {
        logger.info(`🌐 [Orchestrator] Solicitando teste E2E para: ${filePath}`);
        const success = await this.qaEngineer.generateE2ETest(filePath, this);
        
        if (success) {
            const testFilePath = filePath.replace(/\.ts$/, '.e2e.test.ts');
            const verifyResult = await this.verifyTest(testFilePath);
            return verifyResult.success;
        }
        return false;
    }

    /**
     * Gera documentação JSDoc/Docstring soberana para um arquivo.
     */
    async generateDocumentation(filePath: string): Promise<boolean> {
        logger.info(`📝 [Orchestrator] Gerando documentação para: ${filePath}`);
        try {
            const fullPath = this.projectRoot.join(filePath).toString();
            const content = await Bun.file(fullPath).text();
            const docstring = await this.docGen.generateDocstring(filePath, content);
            
            if (docstring) {
                // Insere no topo do arquivo
                const newContent = docstring + "\n" + content;
                await Bun.write(fullPath, newContent);
                logger.info(`✨ [Orchestrator] Documentação aplicada: ${filePath}`);
                return true;
            }
        } catch (e) {
            logger.error(`❌ [Orchestrator] Erro ao gerar documentação: ${e}`);
        }
        return false;
    }

    /**
     * Verifica a execução de um arquivo de teste usando Bun, capturando cobertura.
     */
    async verifyTest(testPath: string): Promise<{ success: boolean; output: string; coverage?: number }> {
        const fullPath = this.projectRoot.join(testPath).toString();
        try {
            // Executa com --coverage
            const proc = Bun.spawn(["bun", "test", "--coverage", fullPath], { stdout: "pipe", stderr: "pipe" });
            const stdout = await new Response(proc.stdout).text();
            const stderr = await new Response(proc.stderr).text();
            const exitCode = await proc.exited;
            
            // Tenta extrair a porcentagem de cobertura (heuristicamente do output do Bun)
            const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)/) || stderr.match(/All files\s+\|\s+([\d.]+)/);
            const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : undefined;

            return {
                success: exitCode === 0,
                output: exitCode === 0 ? stdout : stderr,
                coverage
            };
        } catch (e: any) {
            return { success: false, output: e.message };
        }
    }

    /**
     * Tenta corrigir um teste que falhou na validação ou tem baixa cobertura.
     */
    private async autoHealTest(sourceFile: string, testFile: string, errorOutput: string, currentCoverage?: number): Promise<boolean> {
        const coverageMsg = currentCoverage !== undefined ? `\nCobertura Atual: ${currentCoverage}% (Meta: 90%)` : "";
        const prompt = `
O teste unitário para '${sourceFile}' precisa de melhorias.${coverageMsg}
ERRO/OUTPUT:
\`\`\`
${errorOutput}
\`\`\`

REGRAS PhD:
1. Se houve erro de execução, CORRIJA-O.
2. Se a cobertura estiver baixa, ADICIONE novos casos de teste para linhas não cobertas.
3. Se o teste for superficial (poucas asserções comparado à complexidade), APROFUNDE as validações.
Retorne apenas o código TypeScript completo.
`;
        const correctedCode = await this.hubManager.reason(prompt);
        if (correctedCode && !correctedCode.includes("Error:")) {
            const fullPath = this.projectRoot.join(testFile).toString();
            await Bun.write(fullPath, correctedCode);
            
            const finalVerify = await this.verifyTest(testFile);
            if (finalVerify.success && (finalVerify.coverage === undefined || finalVerify.coverage >= 90)) {
                logger.info(`✨ [Orchestrator] Teste Validado PhD (Cobertura: ${finalVerify.coverage || 'OK'}%): ${testFile}`);
                return true;
            }
        }
        
        logger.error(`❌ [Orchestrator] Falha ao auto-corrigir teste: ${testFile}`);
        return false;
    }

    private isHighPriority(finding: GenericFinding): boolean {
        return finding.severity === "CRITICAL" || finding.severity === "HIGH";
    }


    async getSystemHealth360(ctx: ProjectContext, _health: any, findings: GenericFinding[]): Promise<SystemHealth360> {
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

    private async collectQAData(ctx: ProjectContext): Promise<any> {
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

    private _enrichPathMetrics(ctx: ProjectContext): void {
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
        const briefing = new BriefingAgent(this.projectRoot.toString(), this.hubManager);
        return await briefing.generateMorningReport();
    }

    async runMaintenance() {
        logger.info("🔧 [Orchestrator] Iniciando manutenção do sistema...");
        await this.pruningAgent.execute({ days: 30 });
    }

    async generateFullDiagnostic(options: { autoHeal: boolean, dryRun?: boolean }): Promise<Path | any> {
        logger.info("🚀 Acionando DiagnosticPipeline (Bun Version)...");
        const pipeline = new DiagnosticPipeline(this);
        return await pipeline.execute({ autoHeal: options.autoHeal, dryRun: options.dryRun });
    }

    private _logPerformance(startTime: number, message: string) {
        const duration = (Date.now() - startTime) / 1000;
        logger.info(`${message} concluído em ${duration.toFixed(4)}s.`);
    }

    public async shutdown() {
        if (this.hubWatcher) {
            this.hubWatcher.stop();
        }
        const { SystemManager } = await import("./system_manager.ts");
        const sm = SystemManager.getInstance();
        await sm.shutdown();
    }
}
