import winston from "winston";
import { AdjustmentCalculator } from "./../Diagnostics/strategies/AdjustmentCalculator.ts";

const logger = winston.child({ module: "PenaltyEngine" });

/**
 * ⚖️ PenaltyEngine — PhD in Health Penalties & Ceiling Calculus
 */
export class PenaltyEngine {
    apply(raw: number, allAlerts: any[], mapData: Record<string, any>, total: number, qaData: any = null, cognitive: any = null): number {
        const adjustments = this.getPilarAdjustments(allAlerts, mapData, qaData, cognitive);
        const totalDrain = Object.entries(adjustments)
            .filter(([key]) => key.startsWith("Quality (") || key.startsWith("Cognitive ("))
            .reduce((sum, [, v]) => sum + v, 0);

        let ceiling = 100;
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevs = new Set(alerts.map(r => r.severity?.toLowerCase()));

        if (sevs.has('critical') || sevs.has('high')) ceiling = 70;
        else if (sevs.has('medium')) ceiling = 95;
        else if (totalDrain > 0) ceiling = 100;

        const final = Math.max(0, Math.round(Math.min(raw, ceiling) - totalDrain));
        logger.info(`🏆 [HealthCalculus] Raw: ${raw.toFixed(3)} | Ceiling: ${ceiling} | Drain: ${totalDrain} | Final: ${final}`);
        return final;
    }

    getPilarAdjustments(allAlerts: any[], mapData: Record<string, any>, qaData: any = null, cognitive: any = null): Record<string, number> {
        const caps = { cc: 5, cognitive: 4, nesting: 3, cbo: 3, dit: 2, miLow: 4, miCritical: 3, defect: 3, gateRed: 3, shadow: 3 };
        const stats = qaData?.matrix ? AdjustmentCalculator.calculate(qaData.matrix, mapData, caps) : { total: 0, shallow: 0 };
        const prop = (count: number, cap: number) => Math.round(Math.min(cap, (count / Math.max(1, stats.total)) * cap) * 10) / 10;

        const cogPenalty = cognitive?.status === "FAIL" ? 5 : (cognitive?.status === "DEGRADED" ? 2 : 0);

        return {
            "Cognitive (System Sanity)": cogPenalty,
            "Quality (CC > 20 - High Risk)": prop(stats.cc, caps.cc), "Quality (Cognitive > 15)": prop(stats.cog, caps.cognitive), "Quality (Nesting > 3)": prop(stats.nest, caps.nesting),
            "Quality (CBO > 10 - High Coupling)": prop(stats.cbo, caps.cbo), "Quality (DIT > 5 - Deep Inheritance)": prop(stats.dit, caps.dit), "Quality (MI < 10 - Low Maint)": prop(stats.miL, caps.miLow),
            "Quality (MI < 5 - Critical)": prop(stats.miC, caps.miCritical), "Quality (Defect Density > 1/KLOC)": prop(stats.def, caps.defect), "Quality (Gate RED)": prop(stats.red, caps.gateRed),
            "Quality (Shadow Non-Compliant)": prop(stats.shad, caps.shadow), "Stability (Coverage)": (stats.shallow || 0) * 0.01,
            "Security (Vulnerabilities)": allAlerts.filter(r => r.severity === 'critical' || r.severity === 'high').length * 10, "Excellence (Documentation)": allAlerts.filter(r => typeof r === 'string').length * 0.1,
            _raw_ccCount: stats.cc, _raw_cognitiveCount: stats.cog, _raw_nestingCount: stats.nest, _raw_cboCount: stats.cbo, _raw_ditCount: stats.dit, _raw_miLowCount: stats.miL,
            _raw_miCriticalCount: stats.miC, _raw_defectCount: stats.def, _raw_gateRedCount: stats.red, _raw_shadowCount: stats.shad, _raw_totalAnalyzed: stats.total
        };
    }
}
