import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc";

const logger = winston.child({ module: "FindingDeduplicator" });

/**
 * 🔬 Assistente de Deduplicação Forense (gRPC Proxy).
 */
export class FindingDeduplicator {
    constructor(private hubManager?: HubManagerGRPC) { }

    async deduplicate(allRawFindings: any[]): Promise<any[]> {
        if (allRawFindings.length === 0) return [];

        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not provided to FindingDeduplicator. Fallback to raw findings.");
            return allRawFindings;
        }

        try {
            logger.info(`🔬 [Deduplicator] Proxying ${allRawFindings.length} findings to Go Hub...`);
            const deduped = await this.hubManager.deduplicate(allRawFindings);
            logger.info(`✅ [Deduplicator] Received ${deduped.length} deduplicated findings.`);
            return deduped;
        } catch (err) {
            logger.error("❌ gRPC deduplication failed", { error: err });
            return allRawFindings;
        }
    }
}

