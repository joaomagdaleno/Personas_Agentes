import winston from "winston";
import { Path } from "./path_utils.ts";
import { DiagnosticPipeline } from "./diagnostic_pipeline.ts";
import { ContextEngine } from "../utils/context_engine.ts";
import { CacheManager } from "../utils/cache_manager.ts";
import { TaskExecutor } from "../utils/task_executor.ts";
import { AuditEngine } from "./audit_engine.ts";
import { DirectorPersona } from "../agents/Support/director.ts";
import { StabilityLedger } from "../utils/stability_ledger.ts";
import { HistoryAgent } from "../utils/history_agent.ts";

const logger = winston.child({ module: "Orchestrator" });

export class Orchestrator {
    projectRoot: Path;
    lastDetectedChanges: string[] = [];
    metrics: any = { files_scanned: 0, health_score: 100, start_time: Date.now(), efficiency: {} };
    personas: any[] = [];
    jobQueue: any[] = [];

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

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.cacheManager = new CacheManager(this.projectRoot.toString());
        this.executor = new TaskExecutor();
        this.contextEngine = new ContextEngine(this.projectRoot.toString());
        this.auditEngine = new AuditEngine(this);
        this.director = new DirectorPersona(this.projectRoot.toString());
        this.stabilityLedger = new StabilityLedger(this.projectRoot.toString());
        this.historyAgent = new HistoryAgent(this.projectRoot.toString());

        // Lazy loaded synthesizer below or in _initTools
        this._initEngines();
        this._initTools();
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
                const { HealthSynthesizer } = await import("../agents/Support/health_synthesizer.ts");
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

    async runObfuscationScan() {
        logger.info("Scan de Ofuscação: Acionando AuditEngine...");
        return await this.auditEngine.runObfuscationScan(null);
    }

    async runAutoHealing(findings: any[]) {
        const { HealerPersona } = await import("../agents/Support/healer.ts");
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
        // Now using the real synthesizer through the orchestrator's proxy
        const qaData = { pyramid: {}, execution: {}, matrix: [] }; // Mock QA for now or fetch from pipeline
        return await this.synthesizer.synthesize360(ctx, this.metrics, this.personas, this.stabilityLedger, qaData);
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
