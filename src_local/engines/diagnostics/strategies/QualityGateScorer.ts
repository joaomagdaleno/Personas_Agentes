import { type MetricsResult } from "../metrics_engine";
import { GateCalculator } from "./GateCalculator.ts";
import { ThresholdEvaluator } from "./ThresholdEvaluator.ts";

/**
 * 🚥 QualityGateScorer — specialized in multi-dimensional quality thresholds.
 */
export class QualityGateScorer {
    static calculateScore(metrics: MetricsResult): number {
        return GateCalculator.calculate(metrics);
    }

    static evaluateGate(metrics: MetricsResult): { passed: boolean; issues: string[]; score: number } {
        const issues = ThresholdEvaluator.evaluate(metrics);
        return { passed: issues.length === 0, issues, score: this.calculateScore(metrics) };
    }
}
