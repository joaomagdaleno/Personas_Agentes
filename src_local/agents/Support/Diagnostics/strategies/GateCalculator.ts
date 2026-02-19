import { type MetricsResult } from "../metrics_engine";

export class GateCalculator {
    static calculate(m: MetricsResult): number {
        const checks = [
            () => m.maintainabilityIndex >= 20 ? 25 : (m.maintainabilityIndex >= 10 ? 15 : 5),
            () => m.cyclomaticComplexity <= 10 ? 20 : (m.cyclomaticComplexity <= 20 ? 15 : (m.cyclomaticComplexity <= 30 ? 10 : 5)),
            () => m.cognitiveComplexity <= 10 ? 15 : (m.cognitiveComplexity <= 20 ? 10 : (m.cognitiveComplexity <= 30 ? 5 : 0)),
            () => m.nestingDepth <= 3 ? 10 : (m.nestingDepth <= 5 ? 5 : 0),
            () => m.cbo <= 3 ? 10 : (m.cbo <= 5 ? 5 : 0),
            () => m.defectDensity <= 1 ? 10 : (m.defectDensity <= 3 ? 5 : 0),
            () => m.dit <= 2 ? 5 : 0,
            () => m.qualityGate === "GREEN" ? 5 : (m.qualityGate === "YELLOW" ? 2 : 0)
        ];
        return checks.reduce((sum, chk) => sum + chk(), 0);
    }
}
