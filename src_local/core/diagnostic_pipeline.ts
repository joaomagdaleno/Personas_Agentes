import winston from "winston";
import { FindingDeduplicator } from "../utils/finding_deduplicator.ts";
import { Path } from "./path_utils.ts";
import { DiscoveryAgent } from "../agents/Support/discovery_agent.ts";
import { ValidationAgent } from "../agents/Support/validation_agent.ts";
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
        if (DiagnosticPipeline._isRunning) {
            return new Path("recursion_prevented.md");
        }

        DiagnosticPipeline._isRunning = true;
        try {
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
            const { PersonaLoader } = await import("../utils/persona_loader.ts");
            await PersonaLoader.mobilizeAll(this.orc.projectRoot.toString(), this.orc);
        }
    }
}
