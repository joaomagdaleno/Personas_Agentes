export class AdjustmentCalculator {
    static calculate(matrix: any[], mapData: any, caps: any): any {
        const stats = { cc: 0, cog: 0, nest: 0, cbo: 0, dit: 0, miL: 0, miC: 0, def: 0, red: 0, shad: 0, total: matrix.length, shallow: 0 };
        matrix.forEach((item: any) => {
            const m = item.advanced_metrics || {}, info = mapData[item.file] || {};
            if (m.cyclomaticComplexity > 25) stats.cc++;
            if (m.cognitiveComplexity > 20) stats.cog++;
            if (m.nestingDepth > 5) stats.nest++;
            if (m.cbo > 15) stats.cbo++;
            if (m.dit > 7) stats.dit++;
            if (m.maintainabilityIndex > 0) { if (m.maintainabilityIndex < 10) stats.miL++; if (m.maintainabilityIndex < 5) stats.miC++; }
            if (m.defectDensity > 2) stats.def++;
            if (m.qualityGate === "RED") stats.red++;
            if (m.isShadow && m.shadowCompliance?.compliant === false) stats.shad++;
            if (item.test_status === "SHALLOW" && (["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"].includes(info.component_type) || info.complexity > 1) && m.qualityGate !== "GREEN") stats.shallow++;
        });
        return stats;
    }
}
