import winston from "winston";
import { FindingDeduplicator } from "../utils/finding_deduplicator.ts";
import { Path } from "./path_utils.ts";
import { DiscoveryAgent } from "../agents/Support/Analysis/discovery_agent.ts";
import { ValidationAgent } from "../agents/Support/Automation/validation_agent.ts";
import { DiagnosticFinalizer } from "./diagnostic_finalizer.ts";

const logger = winston.child({ module: "DiagnosticPipeline" });

export class DiagnosticPipeline {
    private static _isRunning = false;
    orc: any;
    deduplicator: FindingDeduplicator;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
        this.deduplicator = new FindingDeduplicator();
    }

    async execute(options: { skipTests?: boolean, autoHeal?: boolean, dryRun?: boolean } = {}): Promise<Path> {
        console.log("DiagnosticPipeline.execute called");
        if (DiagnosticPipeline._isRunning) {
            console.log("DiagnosticPipeline is already running!");
            return new Path("recursion_prevented.md");
        }

        DiagnosticPipeline._isRunning = true;
        try {
            console.log("Calling runAtomicPipeline...");
            return await this.runAtomicPipeline(
                options.skipTests || false,
                options.autoHeal || false,
                options.dryRun || false
            );
        } finally {
            DiagnosticPipeline._isRunning = false;
        }
    }

    private async runAtomicPipeline(skip: boolean, autoHeal: boolean, dryRun: boolean): Promise<Path> {
        const startTime = Date.now();
        await this.reset();

        const discoveryAgent = new DiscoveryAgent(this.orc);
        let [ctx, findings] = await discoveryAgent.runDiscoveryPhase();

        // 🏛️ PhD Census & Cognitive Audit (100% Deep)
        logger.info("🏛️ [Pipeline] Validando Censo PhD e Saúde Cognitiva...");
        const census = await this.orc.director.validatePhDCensus();

        const { QualityAnalyst } = await import("../agents/Support/Diagnostics/quality_analyst.ts");
        const qa = new QualityAnalyst();
        const cognitive = await qa.runCognitiveAudit();

        // Inject into context for reporting
        ctx.census = census;
        ctx.cognitive = cognitive;

        if (autoHeal) {
            logger.info("🩹 [Pipeline] Iniciando Ciclo de Auto-Cura Ativa...");
            const healedCount = await this.orc.runAutoHealing(findings);
            if (healedCount > 0) {
                logger.info(`✨ [Pipeline] ${healedCount} fragilidades curadas autonomamente. Re-validando...`);
                [ctx, findings] = await discoveryAgent.runDiscoveryPhase();
            }
        }

        const validationAgent = new ValidationAgent(this.orc);
        const health = await validationAgent.runValidationPhase(findings, skip);

        const result = await DiagnosticFinalizer.finalize(
            this,
            ctx,
            health,
            this.deduplicator.deduplicate(findings),
            dryRun
        );

        const duration = (Date.now() - startTime) / 1000;
        logger.info(`✅ [Pipeline] Diagnóstico concluído em ${duration.toFixed(4)}s.`);

        return result;
    }

    private async reset() {
        this.orc.jobQueue = [];
        this.orc.metrics.all_findings = [];
        // Mobilize personas logic if needed
        if (this.orc.personas.length === 0) {
            const { PersonaRegistry } = await import("../utils/persona_registry.ts");
            await PersonaRegistry.mobilizeAll(this.orc.projectRoot.toString(), this.orc);
        }
    }
}
