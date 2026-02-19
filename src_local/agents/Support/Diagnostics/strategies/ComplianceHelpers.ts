/**
 * ⚖️ ComplianceHelpers - PhD in Quality Standards
 */
export class ComplianceHelpers {
    static checkQuality(m: any, stats: any, item: any, info: any) {
        if (m.maintainabilityIndex > 0 && m.maintainabilityIndex < 10) stats.miL++;
        if (m.maintainabilityIndex > 0 && m.maintainabilityIndex < 5) stats.miC++;
        if (m.defectDensity > 1) stats.def++;
        if (m.qualityGate === "RED") stats.red++;
        if (m.isShadow && m.shadowCompliance?.compliant === false) stats.shad++;
        this._checkShallow(item, info, m, stats);
    }

    private static _checkShallow(item: any, info: any, m: any, stats: any) {
        const isL = ["AGENT", "CORE", "LOGIC", "UTIL", "UNKNOWN"].includes(info.component_type);
        if (item.test_status === "SHALLOW" && (isL || (info.complexity || 0) > 1) && m.qualityGate !== "GREEN") stats.shallow++;
    }
}
