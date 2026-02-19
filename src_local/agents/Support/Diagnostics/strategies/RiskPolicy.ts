/**
 * ⚖️ RiskPolicy — specialized in risk levels and quality gates.
 */
export class RiskPolicy {
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
}
