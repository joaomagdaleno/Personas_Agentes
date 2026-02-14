import winston from "winston";
import { Path } from "../../core/path_utils.ts";

const logger = winston.child({ module: "ConnectivityMapper" });

/**
 * 🌐 Mapeador de Conectividade PhD (Bun Version).
 */
export class ConnectivityMapper {
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
        logger.debug(`⏱️ [Connectivity] Mapeamento em ${filePath} in ${duration.toFixed(4)}s`);

        return {
            in: afferent,
            out: eferent,
            instability: instability
        };
    }
}
