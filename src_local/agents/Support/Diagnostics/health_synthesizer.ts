import winston from "winston";
import { ScoreCalculator } from "./score_calculator";

const logger = winston.child({ module: "HealthSynthesizer" });

/**
 * 🩺 HealthSynthesizer PhD (Bridge Version).
 * Sintetiza a saúde global do sistema usando o ScoreCalculator.
 */
export class HealthSynthesizer {
    private calculator: ScoreCalculator;

    constructor() {
        this.calculator = new ScoreCalculator();
    }

    /**
     * Síntese 360 do sistema.
     */
    async synthesize360(context: any, metrics: any, personas: any, ledger: any, qaData: any): Promise<any> {
        logger.info("🩺 [Synthesizer] Sintetizando visão 360 do sistema...");

        const allAlerts = context.alerts || [];
        const mapData = context.map || {};

        const { score, breakdown } = this.calculator.calculateFinalScore(mapData, allAlerts, qaData);

        return {
            health_score: score,
            breakdown: breakdown,
            objective: context.identity?.core_mission || "Manutenção de Integridade",
            timestamp: new Date().toISOString(),
            status: score > 80 ? "HEALTHY" : (score > 50 ? "WARNING" : "CRITICAL")
        };
    }
}
