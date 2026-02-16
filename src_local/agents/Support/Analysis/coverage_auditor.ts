import winston from "winston";
import { Path } from "../../../core/path_utils.ts";

const logger = winston.child({ module: "CoverageAuditor" });

/**
 * 📐 Auditor de Cobertura PhD (Bun Version).
 */
export class CoverageAuditor {
    detectTest(filePath: Path, compType: string, allFiles: string[], fInfo: any = null): boolean {
        const type = compType || "UNKNOWN";
        const isBoilerplate = fInfo ? (fInfo.complexity || 1) <= 1 : true;

        if (type === "DOC") return true;
        if (["CONFIG", "PACKAGE_MARKER", "UTIL"].includes(type) && isBoilerplate) return true;
        if (type === "TEST") return true;

        const nameStem = filePath.name().split('.')[0]!.toLowerCase();

        // Rigor PhD: Busca Semântica
        for (const fileName of allFiles) {
            const lowName = fileName.toLowerCase();
            if (lowName.startsWith("test_") && lowName.includes(nameStem)) {
                logger.debug(`Test match found: ${fileName}`);
                return true;
            }
        }

        return false;
    }
}
