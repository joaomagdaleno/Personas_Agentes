import { type MetricsResult } from "../metrics_engine";

export class GateCalculator {
    static calculate(m: MetricsResult): number {
        return [
            this.scoreMI(m.maintainabilityIndex),
            this.scoreCC(m.cyclomaticComplexity),
            this.scoreCog(m.cognitiveComplexity),
            this.scoreNest(m.nestingDepth),
            this.scoreCBO(m.cbo),
            this.scoreDefect(m.defectDensity),
            this.scoreDIT(m.dit),
            this.scoreGate(m.qualityGate)
        ].reduce((a, b) => a + b, 0);
    }

    private static scoreMI(v: number): number {
        return [[20, 25], [10, 15], [0, 5]].find(l => v >= l[0]!)?.[1] || 5;
    }

    private static scoreCC(v: number): number {
        return [[10, 20], [20, 15], [30, 10], [999, 5]].find(l => v <= l[0]!)?.[1] || 5;
    }

    private static scoreCog(v: number): number {
        return [[10, 15], [20, 10], [30, 5], [999, 0]].find(l => v <= l[0]!)?.[1] || 0;
    }

    private static scoreNest(v: number): number {
        return [[3, 10], [5, 5], [999, 0]].find(l => v <= l[0]!)?.[1] || 0;
    }

    private static scoreCBO(v: number): number {
        return [[3, 10], [5, 5], [999, 0]].find(l => v <= l[0]!)?.[1] || 0;
    }

    private static scoreDefect(v: number): number {
        return [[1, 10], [3, 5], [999, 0]].find(l => v <= l[0]!)?.[1] || 0;
    }

    private static scoreDIT(v: number): number {
        return v <= 2 ? 5 : 0;
    }

    private static scoreGate(v: string): number {
        return ({ "GREEN": 5, "YELLOW": 2 } as any)[v] || 0;
    }
}
