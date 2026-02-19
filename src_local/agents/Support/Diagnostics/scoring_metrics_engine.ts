import winston from "winston";
import { MetricsEngine, type MetricsResult } from "./metrics_engine";
import { PurityScorer } from "./strategies/PurityScorer.ts";
import { StabilityScorer } from "./strategies/StabilityScorer.ts";
import { ObservabilityScorer, SecurityScorer, ExcellenceScorer } from "./strategies/OtherScorers.ts";
import { QualityGateScorer } from "./strategies/QualityGateScorer.ts";

const logger = winston.child({ module: "ScoringMetricsEngine" });

/**
 * ⚙️ ScoringMetricsEngine — PhD in Health Metrics & Stability Calculus
 * 
 * Agora refatorado para usar Estratégias de Pontuação (Pillar Strategies).
 */
export class ScoringMetricsEngine {
    private metricsEngine: MetricsEngine;

    constructor() {
        this.metricsEngine = new MetricsEngine();
    }

    calculateAdvancedMetrics(content: string, filePath: string, dependencies: string[] = [], bugCount: number = 0): MetricsResult {
        return this.metricsEngine.analyzeFile(content, filePath, dependencies, bugCount);
    }

    validateShadow(filePath: string, content: string, dependencies: string[]): { compliant: boolean; reason: string; metrics: MetricsResult } {
        const metrics = this.metricsEngine.analyzeFile(content, filePath, dependencies);
        const validation = this.metricsEngine.validateShadowCompliance(metrics);
        return { ...validation, metrics };
    }

    calcPurity(mapData: Record<string, any>, total: number): [number, number] {
        return PurityScorer.calculate(mapData, total);
    }

    calcStability(mapData: Record<string, any>): [number, number, number] {
        return StabilityScorer.calculate(mapData);
    }

    calcObservability(mapData: Record<string, any>): [number, number, number] {
        return ObservabilityScorer.calculate(mapData);
    }

    calcSecurity(alerts: any[]): [number, number] {
        return SecurityScorer.calculate(alerts);
    }

    calcExcellence(mapData: Record<string, any>, total: number): [number, number] {
        return ExcellenceScorer.calculate(mapData, total);
    }

    getVitals(mapData: Record<string, any>): { dark_matter: string[], brittle_points: string[] } {
        return StabilityScorer.getVitals(mapData);
    }

    calcQualityScore(metrics: MetricsResult): number {
        return QualityGateScorer.calculateScore(metrics);
    }

    evaluateQualityGate(metrics: MetricsResult): { passed: boolean; issues: string[]; score: number } {
        return QualityGateScorer.evaluateGate(metrics);
    }

    getEffectiveComplexity(metrics: MetricsResult): number {
        return metrics.isShadow ? metrics.shadowComplexity : metrics.cyclomaticComplexity;
    }
}
