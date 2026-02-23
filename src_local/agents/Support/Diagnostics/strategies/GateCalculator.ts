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
        if (v >= 20) return 25;
        if (v >= 10) return 15;
        return 5;
    }

    private static scoreCC(v: number): number {
        if (v <= 10) return 20;
        if (v <= 20) return 15;
        if (v <= 30) return 10;
        return 5;
    }

    private static scoreCog(v: number): number {
        if (v <= 10) return 15;
        if (v <= 20) return 10;
        if (v <= 30) return 5;
        return 0;
    }

    private static scoreNest(v: number): number {
        if (v <= 3) return 10;
        if (v <= 5) return 5;
        return 0;
    }

    private static scoreCBO(v: number): number {
        if (v <= 3) return 10;
        if (v <= 5) return 5;
        return 0;
    }

    private static scoreDefect(v: number): number {
        if (v <= 1) return 10;
        if (v <= 3) return 5;
        return 0;
    }

    private static scoreDIT(v: number): number {
        return v <= 2 ? 5 : 0;
    }

    private static scoreGate(v: string): number {
        if (v === "GREEN") return 5;
        if (v === "YELLOW") return 2;
        return 0;
    }
}
