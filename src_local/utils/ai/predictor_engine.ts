import winston from "winston";
import * as fs from "fs";
import { MicroPredictor } from "./MicroPredictor.ts";
import { Path } from "../../core/path_utils.ts";

const logger = winston.child({ module: "PredictorEngine" });

/**
 * 🔮 PredictorEngine
 * Wraps the MicroGPT sequence anomaly detector. Keeps track of the current
 * sequence of orchestration events to flag bizarre/unexpected operational flows.
 */
export class PredictorEngine {
    private predictor: MicroPredictor;
    private currentSequence: string[] = [];
    private projectRoot: string;

    // The history of previous healthy runs used to train the system dynamically.
    // In a full production scenario this would load from a JSON file.
    private trainingHistory: string[][] = [];

    // All possible expected events that happen during diagnostics/audits.
    public readonly VOCABULARY = [
        "PIPELINE_START",
        "DISCOVERY_PHASE_START",
        "DISCOVERY_FINDINGS",
        "CENSUS_VALIDATION",
        "COGNITIVE_AUDIT",
        "AUTO_HEAL_ATTEMPT",
        "AUTO_HEAL_SUCCESS",
        "VALIDATION_PHASE",
        "METRICS_GENERATED",
        "PIPELINE_FINISHED",
        // Anomalous/Error states we might see naturally
        "PIPELINE_ABORTED",
        "FATAL_ERROR",
        "TIMEOUT",
        // Hardware & System Integrity Events (New in Phase 5)
        "CPU_STRESS",
        "MEMORY_HIGH",
        "HEAL_THROTTLED",
        "CONCURRENCY_CAP_REACHED"
    ];

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.predictor = new MicroPredictor(this.VOCABULARY);
        const loaded = this.loadModel();
        if (!loaded) {
            this.loadOrSeedTrainingData();
        }
    }

    /**
     * Records an event in the current pipeline execution window.
     */
    public recordEvent(eventName: string): void {
        if (!this.VOCABULARY.includes(eventName)) {
            logger.debug(`[Predictor] Ignoing unknown event: ${eventName}`);
            return;
        }
        this.currentSequence.push(eventName);
        logger.debug(`[Predictor] Event recorded: ${eventName} (Window: ${this.currentSequence.length})`);
    }

    /**
     * Clears the current sequence window (e.g. when a new pipeline starts).
     */
    public clearCurrentSequence(): void {
        this.currentSequence = [];
    }

    /**
     * Commits the current successful sequence to the training history to continuously learn.
     */
    public learnCurrentSequence(): void {
        if (this.currentSequence.length > 2) {
            this.trainingHistory.push([...this.currentSequence]);
            // Keep only the last 50 healthy sequences so it adapts over time without exploding memory
            if (this.trainingHistory.length > 50) this.trainingHistory.shift();

            // Re-train slightly on the new reality
            this.predictor.train(this.trainingHistory, 50, 0.01);
            logger.info(`🔮 [Predictor] Learned new successful pattern. (History size: ${this.trainingHistory.length})`);
        }
    }

    /**
     * Mathematically evaluates how "weird" the current sequence of events is.
     * @returns Anomaly Score (Perplexity / Loss). Higher is worse.
     */
    public evaluateCurrentFlow(): number {
        if (this.currentSequence.length === 0) return 0;
        const loss = this.predictor.calculateAnomalyScore(this.currentSequence);
        return loss;
    }

    /**
     * Saves the current model weights to disk.
     */
    public saveModel(): void {
        try {
            const weights = this.predictor.exportWeights();
            const configPath = `${this.projectRoot}/.gemini/microgpt_weights.json`;
            fs.writeFileSync(configPath, JSON.stringify(weights, null, 2));
            logger.info(`🔮 [Predictor] Model weights saved to ${configPath}`);
        } catch (err) {
            logger.error(`🚨 [Predictor] Failed to save weights: ${err}`);
        }
    }

    /**
     * Loads the model weights from disk.
     */
    public loadModel(): boolean {
        try {
            const configPath = `${this.projectRoot}/.gemini/microgpt_weights.json`;
            if (fs.existsSync(configPath)) {
                const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                this.predictor.importWeights(data);
                logger.info(`🔮 [Predictor] Model weights loaded from ${configPath}`);
                return true;
            }
        } catch (err) {
            logger.warn(`⚠️ [Predictor] Failed to load weights: ${err}`);
        }
        return false;
    }

    /**
     * Initializes the Predictor with a "Healthy Baseline" so it knows what normal looks like.
     */
    private loadOrSeedTrainingData(): void {
        // Here we seed a perfectly healthy, standard diagnostic run.
        const baselineHealthyRun = [
            "PIPELINE_START",
            "DISCOVERY_PHASE_START",
            "DISCOVERY_FINDINGS",
            "CENSUS_VALIDATION",
            "COGNITIVE_AUDIT",
            "VALIDATION_PHASE",
            "METRICS_GENERATED",
            "PIPELINE_FINISHED"
        ];

        const baselineWithHeal = [
            "PIPELINE_START",
            "DISCOVERY_PHASE_START",
            "DISCOVERY_FINDINGS",
            "CENSUS_VALIDATION",
            "COGNITIVE_AUDIT",
            "AUTO_HEAL_ATTEMPT",
            "AUTO_HEAL_SUCCESS",
            "VALIDATION_PHASE",
            "METRICS_GENERATED",
            "PIPELINE_FINISHED"
        ];

        // Seed with multiple copies to form a strong prior distribution
        for (let i = 0; i < 5; i++) {
            this.trainingHistory.push([...baselineHealthyRun]);
        }
        for (let i = 0; i < 3; i++) {
            this.trainingHistory.push([...baselineWithHeal]);
        }

        logger.info("🔮 [Predictor] Initializing MicroGPT Anomaly Neural Engine...");
        this.predictor.train(this.trainingHistory, 150, 0.05);
        logger.info("🔮 [Predictor] Neural baseline established.");
    }

    /**
     * Returns sanity metrics for reporting.
     */
    public getSanityMetrics(): { score: number, status: string, label: string } {
        const score = this.evaluateCurrentFlow();
        let status = "Healthy";
        let label = "✅ Sanidade Neural Nominal";

        if (score > 1.5) {
            status = "Suspicious";
            label = "⚠️ Fluxo Não-Convencional Detectado";
        }
        if (score > 3.0) {
            status = "Anomaly";
            label = "🚨 Anomalia Sequencial Crítica";
        }

        return { score, status, label };
    }
}
