import { HubManagerGRPC } from "../../../core/hub_manager_grpc";
import { Path } from "../../../core/path_utils.ts";
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
            const results = await this.hubManager.getConnectivity(allMap);
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
            const deps = otherData.dependencies || [];
            if (deps.some((imp: string) => imp.includes(fileStem))) {
                afferent += 1;
            }
        }

        const instability = (afferent + eferent) > 0 ? eferent / (afferent + eferent) : 0;
        const duration = (Date.now() - startTime) / 1000;
        logger.debug(`⏱️ [Connectivity] Single analysis for ${filePath} in ${duration.toFixed(4)}s`);

        return { in: afferent, out: eferent, instability: instability };
    }
}
