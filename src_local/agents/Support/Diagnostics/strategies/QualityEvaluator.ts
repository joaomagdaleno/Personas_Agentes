/**
 * 💎 QualityEvaluator — Specialized in health synthesis and compliance.
 */
export class QualityEvaluator {
    static calculateMaintainabilityIndex(volume: number, cyclomaticComplexity: number, sloc: number): number {
        if (sloc <= 0) return 100;
        const logVolume = Math.log(Math.max(1, volume));
        const logLOC = Math.log(sloc);
        let mi = 171 - 5.2 * logVolume - 0.23 * cyclomaticComplexity - 16.2 * logLOC;
        mi = mi * 100 / 171;
        return Math.max(0, Math.min(100, mi));
    }

    static determineRiskLevel(cyclomatic: number, cognitive: number, mi: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
        if (cyclomatic > 50 || mi < 9) return "CRITICAL";
        if (cyclomatic > 20 || mi < 10) return "HIGH";
        if (cyclomatic > 10 || mi < 20) return "MODERATE";
        return "LOW";
    }

    static determineQualityGate(mi: number, cc: number, defectDensity: number, sloc: number = 0): "GREEN" | "YELLOW" | "RED" {
        // 🔬 Technical Sovereignty: Componentes abaixo do nível de hotspot (>20) e sem defeitos são GREEN.
        if (cc <= 20 && defectDensity === 0) return "GREEN";

        if (mi >= 15 && cc <= 20 && defectDensity <= 0.5) return "GREEN";
        if (mi >= 8 && cc <= 40 && defectDensity <= 2) return "YELLOW";
        return "RED";
    }

    static validateShadowCompliance(metrics: any): { compliant: boolean; reason: string } {
        if (!metrics.isShadow) return { compliant: true, reason: "Não é um shadow" };
        if (metrics.shadowComplexity > 15) return { compliant: false, reason: `Complexidade shadow (${metrics.shadowComplexity}) > 15` };
        if (metrics.maintainabilityIndex < 20) return { compliant: false, reason: `MI (${metrics.maintainabilityIndex.toFixed(1)}) < 20` };
        if (metrics.nestingDepth > 3) return { compliant: false, reason: `Aninhamento (${metrics.nestingDepth}) > 3` };
        return { compliant: true, reason: "Shadow complacente" };
    }

    static getMIStatus(mi: number): string {
        if (mi >= 20) return "🟢 GOOD";
        if (mi >= 10) return "🟡 MODERATE";
        return "🔴 LOW";
    }
}
