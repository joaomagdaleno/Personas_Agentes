import winston from "winston";
import { AdjustmentCalculator } from "./../Diagnostics/strategies/AdjustmentCalculator.ts";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "PenaltyEngine" });

/**
 * ⚖️ PenaltyEngine — PhD in Health Penalties (gRPC Proxy).
 */
export class PenaltyEngine {
    constructor(private hubManager?: HubManagerGRPC) { }

    async apply(raw: number, allAlerts: any[], mapData: Record<string, any>, total: number, qaData: any = null, cognitive: any = null): Promise<number> {
        if (this.hubManager) {
            try {
                return await this.applyRust(raw, allAlerts, mapData, qaData, cognitive);
            } catch (err) {
                logger.warn("gRPC penalty calculation failed, falling back to TypeScript", { error: err });
            }
        }

        const adjustments = this.getPilarAdjustments(allAlerts, mapData, qaData, cognitive);
        const totalDrain = Object.entries(adjustments)
            .filter(([key]) => key.startsWith("Quality (") || key.startsWith("Cognitive ("))
            .reduce((sum, [, v]) => sum + v, 0);

        let ceiling = 100;
        const alerts = allAlerts.filter(r => typeof r === 'object' && r !== null);
        const sevs = new Set(alerts.map(r => r.severity?.toLowerCase()));

        if (sevs.has('critical') || sevs.has('high')) ceiling = 70;
        else if (sevs.has('medium')) ceiling = 95;

        const final = Math.max(0, Math.round(Math.min(raw, ceiling) - totalDrain));
        logger.info(`🏆 [HealthCalculus] (TS Fallback) Raw: ${raw.toFixed(3)} | Ceiling: ${ceiling} | Drain: ${totalDrain} | Final: ${final}`);
        return final;
    }

    private async applyRust(raw: number, allAlerts: any[], mapData: Record<string, any>, qaData: any, cognitive: any): Promise<number> {
        const matrix = (qaData?.matrix || []).map((item: any) => {
            const m = item.advanced_metrics || {};
            return {
                file: item.file,
                component_type: mapData[item.file]?.component_type,
                test_status: item.test_status,
                advanced_metrics: {
                    cyclomatic_complexity: m.cyclomaticComplexity,
                    cognitive_complexity: m.cognitiveComplexity,
                    nesting_depth: m.nestingDepth,
                    cbo: m.cbo,
                    dit: m.dit,
                    maintainability_index: m.maintainabilityIndex,
                    defect_density: m.defectDensity,
                    quality_gate: m.qualityGate,
                    is_shadow: m.isShadow,
                    shadow_compliance_compliant: m.shadowCompliance?.compliant
                }
            };
        });

        const request = {
            raw_score: raw,
            alerts: allAlerts.filter(a => typeof a === 'object' && a !== null).map(a => ({ severity: a.severity })),
            matrix,
            cognitive: cognitive ? { status: cognitive.status } : null
        };

        if (!this.hubManager) return raw; // Should not happen given apply() check

        try {
            const response = await this.hubManager.penalty(request);
            if (!response) return raw;
            logger.info(`🏆 [HealthCalculus] (gRPC) Raw: ${raw.toFixed(3)} | Ceiling: ${response.ceiling} | Drain: ${response.total_drain} | Final: ${response.final_score}`);
            return response.final_score;
        } catch (error) {
            logger.error(`❌ [PenaltyEngine] gRPC call failed:`, error);
            return raw;
        }
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
