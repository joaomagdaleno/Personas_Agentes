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

        const pillars = this.calculatePillars(mapData, allAlerts, total);
        const raw = this.calculateRawScore(pillars, mapData, qaData, total);

        const finalScore = this.penaltyEngine.apply(raw, allAlerts, mapData, total, qaData, cognitive);
        const adj = this.penaltyEngine.getPilarAdjustments(allAlerts, mapData, qaData, cognitive);

        return {
            score: finalScore,
            breakdown: this.buildBreakdown(pillars, adj)
        };
    }

    private calculatePillars(mapData: any, allAlerts: any[], total: number) {
        return {
            stability: this.metricsEngine.calcStability(mapData)[0],
            purity: this.metricsEngine.calcPurity(mapData, total)[0],
            observability: this.metricsEngine.calcObservability(mapData)[0],
            security: this.metricsEngine.calcSecurity(allAlerts)[0],
            excellence: this.metricsEngine.calcExcellence(mapData, total)[0]
        };
    }

    private calculateRawScore(pillars: any, mapData: any, qaData: any, total: number): number {
        const pillarSum = Object.values(pillars).reduce((a: any, b: any) => a + b, 0) as number;
        return pillarSum + (this.calculateQualityBonus(mapData, qaData) / total);
    }

    private buildBreakdown(pillars: any, adj: any): Record<string, number> {
        const baseBreakdown = {
            "Stability (Coverage)": this.round(pillars.stability - (adj["Stability (Coverage)"] || 0)),
            "Purity (Complexity)": this.round(pillars.purity - (adj["Purity (Complexity)"] || 0)),
            "Observability (Telemetry)": this.round(pillars.observability),
            "Security (Vulnerabilities)": this.round(pillars.security - (adj["Security (Vulnerabilities)"] || 0)),
            "Excellence (Documentation)": this.round(pillars.excellence - (adj["Excellence (Documentation)"] || 0)),
        };

        return { ...baseBreakdown, ...this.mapQualityAdjs(adj) };
    }

    private round(val: number): number {
        return Math.round(Math.max(0, val) * 10) / 10;
    }

    private mapQualityAdjs(adj: any) {
        const keys = ["Cognitive (System Sanity)", "Quality (CC > 20 - High Risk)", "Quality (Cognitive > 15)", "Quality (Nesting > 3)", "Quality (CBO > 10 - High Coupling)", "Quality (DIT > 5 - Deep Inheritance)", "Quality (MI < 10 - Low Maint)", "Quality (MI < 5 - Critical)", "Quality (Defect Density > 1/KLOC)", "Quality (Gate RED)", "Quality (Shadow Non-Compliant)"];
        const res: any = {};
        keys.forEach(k => res[k] = adj[k] || 0);

        const rawKeys = ["_raw_ccCount", "_raw_cognitiveCount", "_raw_nestingCount", "_raw_cboCount", "_raw_ditCount", "_raw_miLowCount", "_raw_miCriticalCount", "_raw_defectCount", "_raw_gateRedCount", "_raw_shadowCount", "_raw_totalAnalyzed"];
        rawKeys.forEach(k => res[k] = adj[k] || 0);

        return res;
    }

    private calculateQualityBonus(mapData: Record<string, any>, qaData: any): number {
        if (!qaData?.matrix) return 0;
        return (qaData.matrix as any[]).reduce((sum, item) => sum + this.getItemQualityBonus(item), 0);
    }

    private getItemQualityBonus(item: any): number {
        const m = item.advanced_metrics || {};
        return this.calculateBaseBonus(m) + this.calculateComplianceBonus(m);
    }

    private calculateBaseBonus(m: any): number {
        let b = this.getMaintainabilityBonus(m.maintainabilityIndex);
        if (m.qualityGate === "GREEN") b += 0.3;
        if (m.cyclomaticComplexity <= 10) b += 0.2;
        if (m.riskLevel === "LOW") b += 0.3;
        return b;
    }

    private calculateComplianceBonus(m: any): number {
        if (m.isShadow && m.shadowCompliance?.compliant) return 2.0;
        return 0;
    }

    private getMaintainabilityBonus(mi: number): number {
        if (mi >= 50) return 1.0;
        if (mi >= 20) return 0.5;
        return 0;
    }
}
