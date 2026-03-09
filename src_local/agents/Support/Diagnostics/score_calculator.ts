import winston from "winston";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "ScoreCalculator" });

/**
 * 🧮 ScoreCalculator — PhD in Health Metrics Synthesis (Native gRPC Proxy).
 * 
 * Migrated to delegate all heavy lifting to the Go Hub / Rust Analyzer.
 */
export class ScoreCalculator {
    constructor(private hubManager?: HubManagerGRPC) { }

    /**
     * Calculates final health score using the native gRPC engine.
     */
    async calculateFinalScore(
        mapData: Record<string, any>,
        allAlerts: any[],
        qaData: any = null,
        cognitive: any = null
    ): Promise<{ score: number, breakdown: Record<string, number> }> {

        if (!mapData || Object.keys(mapData).length === 0) {
            return { score: 0, breakdown: {} };
        }

        if (this.hubManager) {
            const scoreRequest = {
                map_data: this.prepareMapData(mapData),
                alerts: allAlerts.map(a => ({ severity: a.severity })),
                qa_data: qaData,
                cognitive: cognitive ? { status: cognitive.status } : null
            };

            const response = await this.hubManager.calculateScore(scoreRequest);
            if (response) {
                return {
                    score: response.score,
                    breakdown: response.breakdown
                };
            }
        }

        logger.warn("⚠️ HubManager not available or gRPC failed, falling back to 0 score.");
        return { score: 0, breakdown: {} };
    }

    /**
     * Normalizes mapData for the Rust bridge (snake_case/expected types).
     */
    private prepareMapData(mapData: Record<string, any>): Record<string, any> {
        const normalized: Record<string, any> = {};
        for (const [file, info] of Object.entries(mapData)) {
            normalized[file] = {
                component_type: info.component_type || "UNKNOWN",
                complexity: info.complexity || 1,
                has_test: info.has_test || false,
                has_telemetry: info.has_telemetry || false,
                purpose: info.purpose || "UNKNOWN",
                advanced_metrics: info.advanced_metrics ? {
                    cyclomatic_complexity: info.advanced_metrics.cyclomaticComplexity || 1,
                    cognitive_complexity: info.advanced_metrics.cognitiveComplexity || 0,
                    maintainability_index: info.advanced_metrics.maintainabilityIndex || 100,
                    quality_gate: info.advanced_metrics.qualityGate || "GREEN",
                    nesting_depth: info.advanced_metrics.nestingDepth || 0,
                    cbo: info.advanced_metrics.cbo || 0,
                    dit: info.advanced_metrics.dit || 0,
                    defect_density: info.advanced_metrics.defectDensity || 0
                } : null
            };
        }
        return normalized;
    }
}
