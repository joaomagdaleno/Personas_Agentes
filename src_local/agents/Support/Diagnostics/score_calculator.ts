import winston from "winston";
import { ScoringMetricsEngine } from "./scoring_metrics_engine.ts";
import { PenaltyEngine } from "./../Core/penalty_engine.ts";

const logger = winston.child({ module: "ScoreCalculator" });

/**
 * 🧮 ScoreCalculator — PhD in Health Metrics Synthesis
 * Calculadora de Métricas de Saúde (Desacoplamento de Complexidade).
 */
export class ScoreCalculator {
    private metricsEngine: ScoringMetricsEngine;
    private penaltyEngine: PenaltyEngine;

    constructor() {
        this.metricsEngine = new ScoringMetricsEngine();
        this.penaltyEngine = new PenaltyEngine();
    }

    calculateFinalScore(mapData: Record<string, any>, allAlerts: any[], qaData: any = null): { score: number, breakdown: Record<string, number> } {
        if (!mapData || Object.keys(mapData).length === 0) {
            return { score: 0, breakdown: {} };
        }

        const total = Object.keys(mapData).length;

        const [stability, ,] = this.metricsEngine.calcStability(mapData);
        const [purity,] = this.metricsEngine.calcPurity(mapData, total);
        const [observability, ,] = this.metricsEngine.calcObservability(mapData);
        const [security,] = this.metricsEngine.calcSecurity(allAlerts);
        const [excellence,] = this.metricsEngine.calcExcellence(mapData, total);

        const raw = stability + purity + observability + security + excellence;
        const finalScore = this.penaltyEngine.apply(raw, allAlerts, mapData, total, qaData);

        const adjustments = this.penaltyEngine.getPilarAdjustments(allAlerts, mapData, qaData);

        return {
            score: finalScore,
            breakdown: {
                "Stability (Coverage)": Math.round(Math.max(0, stability - (adjustments["Stability (Coverage)"] || 0)) * 10) / 10,
                "Purity (Complexity)": Math.round(Math.max(0, purity - (adjustments["Purity (Complexity)"] || 0)) * 10) / 10,
                "Observability (Telemetry)": Math.round(observability * 10) / 10,
                "Security (Vulnerabilities)": Math.round(Math.max(0, security - (adjustments["Security (Vulnerabilities)"] || 0)) * 10) / 10,
                "Excellence (Documentation)": Math.round(Math.max(0, excellence - (adjustments["Excellence (Documentation)"] || 0)) * 10) / 10
            }
        };
    }
}
