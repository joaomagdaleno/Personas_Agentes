import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import { Path } from "../../core/path_utils.ts";
import winston from "winston";

const logger = winston.child({ module: "ConnectivityMapper" });

/**
 * 🌐 Mapeador de Conectividade PhD (gRPC Proxy).
 */
export class ConnectivityMapper {
    constructor(private hubManager?: HubManagerGRPC) { }

    /**
     * Calcula acoplamento de TODOS os arquivos em uma única passada via Hub Proxy.
     */
    async calculateBulk(allMap: Record<string, any>): Promise<Record<string, { in: number, out: number, instability: number }>> {
        if (!this.hubManager) {
            logger.warn("HubManager missing, bulk connectivity analysis skipped");
            return {};
        }

        try {
            const sanitizedMap: Record<string, any> = {};
            for (const [file, data] of Object.entries(allMap)) {
                sanitizedMap[file] = {
                    dependencies: data.dependencies || [],
                    advanced_metrics: data.advanced_metrics ? {
                        cyclomatic_complexity: data.advanced_metrics.cyclomaticComplexity || 1,
                        cognitive_complexity: data.advanced_metrics.cognitiveComplexity || 0,
                        maintainability_index: data.advanced_metrics.maintainabilityIndex || 100,
                        quality_gate: data.advanced_metrics.qualityGate || "GREEN",
                        nesting_depth: data.advanced_metrics.nestingDepth || 0,
                        cbo: data.advanced_metrics.cbo || 0,
                        dit: data.advanced_metrics.dit || 0,
                        defect_density: data.advanced_metrics.defectDensity || 0
                    } : {
                        cyclomatic_complexity: 1,
                        cognitive_complexity: 0,
                        maintainability_index: 100,
                        quality_gate: "GREEN",
                        nesting_depth: 0,
                        cbo: 0,
                        dit: 0,
                        defect_density: 0
                    }
                };
            }
            const results = await this.hubManager.getConnectivity(sanitizedMap);
            const mapping: Record<string, any> = {};

            if (results && Array.isArray(results)) {
                results.forEach((r: any) => {
                    mapping[r.file] = { in: r.afferent, out: r.eferent, instability: r.instability };
                });
            }

            return mapping;
        } catch (err) {
            logger.error("gRPC connectivity analysis failed:", err);
            return {};
        }
    }

    calculateMetrics(filePath: string, data: any, allMap: Record<string, any>): any {
        const startTime = Date.now();
        const eferent = (data.dependencies || []).length;
        let afferent = 0;
        const fileStem = new Path(filePath).stem();

        for (const [otherFile, otherData] of Object.entries(allMap)) {
            if (otherFile === filePath) continue;
            const rawDeps = otherData.dependencies || [];
            const deps = Array.isArray(rawDeps) ? rawDeps : Array.from(rawDeps as any);
            if (deps.some((imp: any) => String(imp).includes(fileStem))) {
                afferent += 1;
            }
        }

        const instability = (afferent + eferent) > 0 ? eferent / (afferent + eferent) : 0;
        const duration = (Date.now() - startTime) / 1000;
        logger.debug(`⏱️ [Connectivity] Single analysis for ${filePath} in ${duration.toFixed(4)}s`);

        return { in: afferent, out: eferent, instability: instability };
    }
}
