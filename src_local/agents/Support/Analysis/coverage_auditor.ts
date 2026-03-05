import winston from "winston";
import { Path } from "../../../core/path_utils.ts";

const logger = winston.child({ module: "CoverageAuditor" });

/**
 * 📐 Auditor de Cobertura PhD (Bun Version).
 */
export class CoverageAuditor {
    detectTest(filePath: Path, compType: string, allFiles: string[], fInfo: any = null): boolean {
        if (this.isExemptFromTesting(compType, fInfo)) return true;

        const cleanStem = this.getCleanStem(filePath.name());
        const normalizedStem = cleanStem.replace(/_/g, "");

        for (const fileName of allFiles) {
            if (this.isTestMatch(fileName, normalizedStem, compType, filePath.name())) {
                return true;
            }
        }

        return false;
    }

    private isExemptFromTesting(compType: string, fInfo: any): boolean {
        const type = compType || "UNKNOWN";
        const isBoilerplate = fInfo ? (fInfo.complexity || 1) <= 1 : true;

        if (type === "DOC" || type === "TEST") return true;
        return ["CONFIG", "PACKAGE_MARKER", "UTIL"].includes(type) && isBoilerplate;
    }

    private getCleanStem(fileName: string): string {
        const rawStem = fileName.split('.')[0]!.toLowerCase();
        return rawStem.replace(/_persona$/, "").replace(/_agent$/, "").replace(/_engine$/, "");
    }

    private isTestMatch(fileName: string, normalizedStem: string, compType: string, originalName: string): boolean {
        const lowName = fileName.toLowerCase();
        const isTestFile = lowName.startsWith("test_") || lowName.endsWith(".test.ts") || lowName.endsWith(".spec.ts");

        if (!isTestFile) return false;

        const normalizedFile = lowName.replace(/_/g, "");
        if (normalizedFile.includes(normalizedStem)) {
            logger.debug(`Test match found: ${fileName} for ${originalName}`);
            return true;
        }

        return compType === "AGENT" && lowName.includes(normalizedStem);
    }
}
