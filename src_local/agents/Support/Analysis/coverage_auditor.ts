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

        // Rigor PhD: Busca Semântica (Pythonic 'test_' OR TypeScript '*.test.ts' / '*.spec.ts')
        for (const fileName of allFiles) {
            const lowName = fileName.toLowerCase();

            // Legacy Python Style
            if (lowName.startsWith("test_") && lowName.includes(nameStem)) {
                logger.debug(`Test match found (legacy): ${fileName}`);
                return true;
            }

            // TypeScript Standard Style
            if ((lowName.endsWith(".test.ts") || lowName.endsWith(".spec.ts")) && lowName.includes(nameStem)) {
                logger.debug(`Test match found (ts-standard): ${fileName}`);
                return true;
            }
        }

        return false;
    }
}
