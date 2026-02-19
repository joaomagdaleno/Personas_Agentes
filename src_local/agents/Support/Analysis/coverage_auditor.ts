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

        const rawStem = filePath.name().split('.')[0]!.toLowerCase();
        const cleanStem = rawStem.replace(/_persona$/, "").replace(/_agent$/, "").replace(/_engine$/, "");

        // Rigor PhD: Busca Semântica Avançada
        for (const fileName of allFiles) {
            const lowName = fileName.toLowerCase();
            const isTestFile = lowName.startsWith("test_") || lowName.endsWith(".test.ts") || lowName.endsWith(".spec.ts");

            if (!isTestFile) continue;

            // 1. Direct match (case-insensitive and ignoring underscores)
            const normalizedFile = lowName.replace(/_/g, "");
            const normalizedStem = cleanStem.replace(/_/g, "");

            if (normalizedFile.includes(normalizedStem)) {
                logger.debug(`Test match found: ${fileName} for ${filePath.name()}`);
                return true;
            }

            // 2. Persona Match (Specialized)
            if (compType === "AGENT" && lowName.includes(normalizedStem)) {
                return true;
            }
        }

        return false;
    }
}
