import winston from "winston";
import { Path } from "../../core/path_utils.ts";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "CoverageAuditor" });

/**
 * 📐 CoverageAuditor PhD (Native gRPC Proxy).
 * 
 * Migrated to delegate PhD-grade test detection to the Go Hub / Rust Analyzer.
 */
export class CoverageAuditor {
    constructor(private hubManager?: HubManagerGRPC) { }

    /**
     * Detects if a file has a corresponding test using native Rust logic.
     */
    async detectTest(filePath: Path, compType: string, allFiles: string[], fInfo: any = null): Promise<boolean> {
        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not available, failing open for test detection.");
            return true;
        }

        const coverageRequest = {
            file_path: filePath.name(),
            component_type: compType || "UNKNOWN",
            all_files: allFiles,
            complexity: fInfo?.complexity || 1
        };

        const response = await this.hubManager.auditCoverage(coverageRequest);
        return response?.has_test ?? false;
    }
}
