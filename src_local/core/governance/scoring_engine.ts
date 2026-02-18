import { ComplianceLevel, HealthScore, POLICIES } from "./policy_definitions.ts";

/**
 * 📊 Scoring Engine (Sovereign).
 * Calculates the systemic health score based on multiple dimensions.
 */
export class ScoringEngine {
    public calculateHealth(data: {
        files: Record<string, any>;
        alerts: any[];
        totalFiles: number;
        avgComplexity: number;
    }): HealthScore {
        const { files, alerts, totalFiles, avgComplexity } = data;

        if (totalFiles === 0) {
            return { stability: 0, purity: 0, observability: 0, security: 0, excellence: 0, compliance: 0, total: 0 };
        }

        const testFiles = Object.values(files).filter((f: any) => f.has_test);
        let stability = (testFiles.length / totalFiles) * 35;

        let purity = Math.max(0, 15 - ((avgComplexity - 1) * 1.5));

        const withTel = Object.values(files).filter((f: any) => f.component_type !== "TEST" && f.telemetry).length;
        let observability = (withTel / totalFiles) * 10;

        const highAlerts = alerts.filter(r => typeof r === "object" && (r.severity === "critical" || r.severity === "high"));
        const medAlerts = alerts.filter(r => typeof r === "object" && r.severity === "medium");
        const lowAlerts = alerts.filter(r => typeof r === "object" && (r.severity === "low" || r.severity === "strategic"));
        const stratAlerts = alerts.filter(r => typeof r === "string");

        let security = Math.max(0, 15 - (highAlerts.length * 5));

        const kdoc = Object.values(files).filter((f: any) => f.purpose && f.purpose !== "UNKNOWN").length;
        let excellence = (kdoc / totalFiles) * 10;

        const complianceLevel = this.getComplianceLevel(highAlerts.length, medAlerts.length);
        const policy = POLICIES[complianceLevel];
        let compliance = policy.vetoThreshold * 15;

        let rawTotal = stability + purity + observability + security + excellence + compliance;

        // 🛡️ Apply Constraints
        let ceiling = 100;
        switch (complianceLevel) {
            case ComplianceLevel.CRITICAL: ceiling = 20; break;
            case ComplianceLevel.DEGRADED: ceiling = 40; break;
            case ComplianceLevel.SUBSTANDARD: ceiling = 60; break;
            case ComplianceLevel.STANDARD: ceiling = 85; break;
            case ComplianceLevel.EXCELLENT: ceiling = 95; break;
            case ComplianceLevel.SOVEREIGN: ceiling = 100; break;
        }

        // 📉 Drain Logic
        const drain = (highAlerts.length * 15) + (medAlerts.length * 5) + (lowAlerts.length * 1) + (stratAlerts.length * 0.5);
        let finalTotal = Math.max(0, Math.min(rawTotal, ceiling) - (drain * 0.2));

        return {
            stability: Number(stability.toFixed(2)),
            purity: Number(purity.toFixed(2)),
            observability: Number(observability.toFixed(2)),
            security: Number(security.toFixed(2)),
            excellence: Number(excellence.toFixed(2)),
            compliance: Number(compliance.toFixed(2)),
            total: Number(finalTotal.toFixed(2))
        };
    }

    public getComplianceLevel(high: number, med: number): ComplianceLevel {
        if (high > 5) return ComplianceLevel.CRITICAL;
        if (high > 2) return ComplianceLevel.DEGRADED;
        if (high > 0) return ComplianceLevel.SUBSTANDARD;
        if (med > 5) return ComplianceLevel.STANDARD;
        if (med > 0) return ComplianceLevel.EXCELLENT;
        return ComplianceLevel.SOVEREIGN;
    }
}
