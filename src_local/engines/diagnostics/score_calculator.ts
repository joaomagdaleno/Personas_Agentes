import winston from "winston";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { FileContextData, QAData, CognitiveStatus } from "../../core/types.ts";

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
        mapData: Record<string, FileContextData>,
        allAlerts: any[],
        qaData: QAData | null = null,
        cognitive: CognitiveStatus | null = null
    ): Promise<{ score: number, breakdown: Record<string, number> }> {

        if (!mapData || Object.keys(mapData).length === 0) {
            return { score: 0, breakdown: {} };
        }

        if (this.hubManager) {
            const scoreRequest = {
                map_data: this.prepareMapData(mapData),
                alerts: allAlerts.map(a => ({ severity: (a.severity || "medium").toLowerCase() })),
                qa_data: qaData ? {
                    matrix: (Array.isArray(qaData.matrix) ? qaData.matrix : []).map((item: any) => ({
                        file: item.file,
                        advanced_metrics: this.normalizeAdvancedMetrics(item.advanced_metrics)
                    }))
                } : null,
                cognitive: cognitive ? { status: cognitive.status } : null
            };

            const response = await this.hubManager.calculateScore(scoreRequest);
            if (response) {
                const scoreData = response as unknown as { score: number, breakdown: Record<string, number> };
                return {
                    score: scoreData.score || 0,
                    breakdown: scoreData.breakdown || {}
                };
            }
        }

        logger.warn("⚠️ HubManager not available or gRPC failed, falling back to 0 score.");
        return { score: 0, breakdown: {} };
    }

    /**
     * Normalizes mapData for the Rust bridge (snake_case/expected types).
     */
    private prepareMapData(mapData: Record<string, FileContextData>): Record<string, any> {
        const normalized: Record<string, any> = {};
        for (const [file, info] of Object.entries(mapData)) {
            normalized[file] = {
                component_type: info.component_type || "UNKNOWN",
                complexity: info.complexity || 1,
                has_test: !!(info.has_test),
                has_telemetry: !!(info.has_telemetry),
                purpose: info.purpose || "UNKNOWN",
                advanced_metrics: this.normalizeAdvancedMetrics(info.advanced_metrics)
            };
        }
        return normalized;
    }

    private normalizeAdvancedMetrics(metrics: any): any {
        if (!metrics) {
            return {
                cyclomatic_complexity: 1,
                cognitive_complexity: 0,
                maintainability_index: 100,
                quality_gate: "GREEN",
                nesting_depth: 0,
                cbo: 0,
                dit: 0,
                defect_density: 0
            };
        }
        return {
            cyclomatic_complexity: metrics.cyclomatic_complexity || metrics.cyclomaticComplexity || 1,
            cognitive_complexity: metrics.cognitive_complexity || metrics.cognitiveComplexity || 0,
            maintainability_index: metrics.maintainability_index || metrics.maintainabilityIndex || 100,
            quality_gate: metrics.quality_gate || metrics.qualityGate || "GREEN",
            nesting_depth: metrics.nesting_depth || metrics.nestingDepth || 0,
            cbo: metrics.cbo || metrics.cbo || 0,
            dit: metrics.dit || metrics.dit || 0,
            defect_density: metrics.defect_density || metrics.defectDensity || 0
        };
    }
}
