import winston from "winston";
import { ScoringMetricsEngine } from "./scoring_metrics_engine.ts";
import { PenaltyEngine } from "./../Core/penalty_engine.ts";

const logger = winston.child({ module: "ScoreCalculator" });

/**
 * 🧮 ScoreCalculator — PhD in Health Metrics Synthesis
 */
export class ScoreCalculator {
    private metricsEngine: ScoringMetricsEngine;
    private penaltyEngine: PenaltyEngine;

    constructor() {
        this.metricsEngine = new ScoringMetricsEngine();
        this.penaltyEngine = new PenaltyEngine();
    }

    calculateFinalScore(mapData: Record<string, any>, allAlerts: any[], qaData: any = null, cognitive: any = null): { score: number, breakdown: Record<string, number> } {
        if (!mapData || Object.keys(mapData).length === 0) return { score: 0, breakdown: {} };
        const total = Object.keys(mapData).length;

        const pillars = {
            stability: this.metricsEngine.calcStability(mapData)[0],
            purity: this.metricsEngine.calcPurity(mapData, total)[0],
            observability: this.metricsEngine.calcObservability(mapData)[0],
            security: this.metricsEngine.calcSecurity(allAlerts)[0],
            excellence: this.metricsEngine.calcExcellence(mapData, total)[0]
        };

        const raw = Object.values(pillars).reduce((a, b) => a + b, 0) + (this.calculateQualityBonus(mapData, qaData) / total);
        const finalScore = this.penaltyEngine.apply(raw, allAlerts, mapData, total, qaData, cognitive);
        const adj = this.penaltyEngine.getPilarAdjustments(allAlerts, mapData, qaData, cognitive);

        return {
            score: finalScore,
            breakdown: {
                "Stability (Coverage)": Math.round(Math.max(0, pillars.stability - (adj["Stability (Coverage)"] || 0)) * 10) / 10,
                "Purity (Complexity)": Math.round(Math.max(0, pillars.purity - (adj["Purity (Complexity)"] || 0)) * 10) / 10,
                "Observability (Telemetry)": Math.round(pillars.observability * 10) / 10,
                "Security (Vulnerabilities)": Math.round(Math.max(0, pillars.security - (adj["Security (Vulnerabilities)"] || 0)) * 10) / 10,
                "Excellence (Documentation)": Math.round(Math.max(0, pillars.excellence - (adj["Excellence (Documentation)"] || 0)) * 10) / 10,
                ...this.mapQualityAdjs(adj)
            }
        };
    }

    private mapQualityAdjs(adj: any) {
        const keys = ["Cognitive (System Sanity)", "Quality (CC > 20 - High Risk)", "Quality (Cognitive > 15)", "Quality (Nesting > 3)", "Quality (CBO > 10 - High Coupling)", "Quality (DIT > 5 - Deep Inheritance)", "Quality (MI < 10 - Low Maint)", "Quality (MI < 5 - Critical)", "Quality (Defect Density > 1/KLOC)", "Quality (Gate RED)", "Quality (Shadow Non-Compliant)"];
        const res: any = {};
        keys.forEach(k => res[k] = adj[k] || 0);
        ["_raw_ccCount", "_raw_cognitiveCount", "_raw_nestingCount", "_raw_cboCount", "_raw_ditCount", "_raw_miLowCount", "_raw_miCriticalCount", "_raw_defectCount", "_raw_gateRedCount", "_raw_shadowCount", "_raw_totalAnalyzed"].forEach(k => res[k] = adj[k] || 0);
        return res;
    }

    private calculateQualityBonus(mapData: Record<string, any>, qaData: any): number {
        if (!qaData?.matrix) return 0;
        return (qaData.matrix as any[]).reduce((sum, item) => {
            const m = item.advanced_metrics || {};
            let b = 0;
            if (m.maintainabilityIndex >= 50) b += 1.0; else if (m.maintainabilityIndex >= 20) b += 0.5;
            if (m.qualityGate === "GREEN") b += 0.3;
            if (m.isShadow && m.shadowCompliance?.compliant) b += 2.0;
            if (m.cyclomaticComplexity <= 10) b += 0.2;
            if (m.riskLevel === "LOW") b += 0.3;
            return sum + b;
        }, 0);
    }
}
