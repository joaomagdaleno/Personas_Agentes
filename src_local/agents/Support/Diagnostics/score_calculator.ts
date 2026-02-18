import winston from "winston";
import { ScoringMetricsEngine } from "./scoring_metrics_engine.ts";
import { PenaltyEngine } from "./../Core/penalty_engine.ts";

const logger = winston.child({ module: "ScoreCalculator" });

/**
 * 🧮 ScoreCalculator — PhD in Health Metrics Synthesis
 * Calculadora de Métricas de Saúde (Desacoplamento de Complexidade).
 * 
 * Agora integrado com 9+ métricas de qualidade:
 * - Complexidade Ciclomática, Cognitiva, Halstead
 * - Profundidade de Aninhamento, LOC, CBO, Ca, DIT
 * - Índice de Manutenibilidade, Densidade de Defeitos
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

        // 📊 Calcular bônus de qualidade das novas métricas
        const qualityBonus = this.calculateQualityBonus(mapData, qaData);

        const raw = stability + purity + observability + security + excellence + qualityBonus;
        const finalScore = this.penaltyEngine.apply(raw, allAlerts, mapData, total, qaData);

        const adjustments = this.penaltyEngine.getPilarAdjustments(allAlerts, mapData, qaData);

        return {
            score: finalScore,
            breakdown: {
                "Stability (Coverage)": Math.round(Math.max(0, stability - (adjustments["Stability (Coverage)"] || 0)) * 10) / 10,
                "Purity (Complexity)": Math.round(Math.max(0, purity - (adjustments["Purity (Complexity)"] || 0)) * 10) / 10,
                "Observability (Telemetry)": Math.round(observability * 10) / 10,
                "Security (Vulnerabilities)": Math.round(Math.max(0, security - (adjustments["Security (Vulnerabilities)"] || 0)) * 10) / 10,
                "Excellence (Documentation)": Math.round(Math.max(0, excellence - (adjustments["Excellence (Documentation)"] || 0)) * 10) / 10,
                // Métricas de qualidade normalizadas (9+)
                "Quality (CC > 20 - High Risk)": adjustments["Quality (CC > 20 - High Risk)"] || 0,
                "Quality (Cognitive > 15)": adjustments["Quality (Cognitive > 15)"] || 0,
                "Quality (Nesting > 3)": adjustments["Quality (Nesting > 3)"] || 0,
                "Quality (CBO > 10 - High Coupling)": adjustments["Quality (CBO > 10 - High Coupling)"] || 0,
                "Quality (DIT > 5 - Deep Inheritance)": adjustments["Quality (DIT > 5 - Deep Inheritance)"] || 0,
                "Quality (MI < 10 - Low Maint)": adjustments["Quality (MI < 10 - Low Maint)"] || 0,
                "Quality (MI < 5 - Critical)": adjustments["Quality (MI < 5 - Critical)"] || 0,
                "Quality (Defect Density > 1/KLOC)": adjustments["Quality (Defect Density > 1/KLOC)"] || 0,
                "Quality (Gate RED)": adjustments["Quality (Gate RED)"] || 0,
                "Quality (Shadow Non-Compliant)": adjustments["Quality (Shadow Non-Compliant)"] || 0,
                // Dados brutos para o relatório (contagens de violações)
                "_raw_ccCount": adjustments["_raw_ccCount"] || 0,
                "_raw_cognitiveCount": adjustments["_raw_cognitiveCount"] || 0,
                "_raw_nestingCount": adjustments["_raw_nestingCount"] || 0,
                "_raw_cboCount": adjustments["_raw_cboCount"] || 0,
                "_raw_ditCount": adjustments["_raw_ditCount"] || 0,
                "_raw_miLowCount": adjustments["_raw_miLowCount"] || 0,
                "_raw_miCriticalCount": adjustments["_raw_miCriticalCount"] || 0,
                "_raw_defectCount": adjustments["_raw_defectCount"] || 0,
                "_raw_gateRedCount": adjustments["_raw_gateRedCount"] || 0,
                "_raw_shadowCount": adjustments["_raw_shadowCount"] || 0,
                "_raw_totalAnalyzed": adjustments["_raw_totalAnalyzed"] || 0,
            }
        };
    }

    /**
     * Calcula bônus de qualidade baseado nas 9+ métricas
     * Bônus positivo para arquivos com boas métricas de qualidade
     */
    private calculateQualityBonus(mapData: Record<string, any>, qaData: any): number {
        let bonus = 0;

        // Se temos dados de matriz de qualidade com métricas avançadas
        if (qaData?.matrix && Array.isArray(qaData.matrix)) {
            for (const item of qaData.matrix) {
                const metrics = item.advanced_metrics || {};

                // Bônus para Manutenibilidade >= 20
                if (metrics.maintainabilityIndex >= 20) {
                    bonus += 0.5;
                }

                // Bônus para Manutenibilidade >= 50 (excelente)
                if (metrics.maintainabilityIndex >= 50) {
                    bonus += 1.0;
                }

                // Bônus para Quality Gate GREEN
                if (metrics.qualityGate === "GREEN") {
                    bonus += 0.3;
                }

                // Bônus especial para shadows compliance (reconhecer esforço)
                if (metrics.isShadow && metrics.shadowCompliance?.compliant) {
                    bonus += 2.0;
                }

                // Bônus para complexidade baixa
                if (metrics.cyclomaticComplexity <= 10) {
                    bonus += 0.2;
                }

                // Bônus para Risk Level LOW
                if (metrics.riskLevel === "LOW") {
                    bonus += 0.3;
                }
            }
        }

        return Math.max(0, bonus);
    }
}
