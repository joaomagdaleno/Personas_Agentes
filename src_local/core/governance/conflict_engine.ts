import winston from "winston";

// Local logger
const logger = winston.child({ module: "ConflictEngine(Gov)" });

/**
 * ⚔️ Conflict Engine (Sovereign).
 * Forensic resolution of merge conflicts.
 */
export class ConflictEngine {
    /**
     * Resolução Forense de Conflitos.
     */
    public resolveMergeConflict(file: string, isProtected: boolean): "OURS" | "THEIRS" | "MANUAL" | "CLEANUP" {
        if (file.endsWith(".pyc") || file.includes("__pycache__") || file.endsWith(".tmp")) return "CLEANUP";
        if (file === "skills_index.json" || file.endsWith(".json") || file.endsWith(".yaml")) return "MANUAL";

        if (isProtected) {
            logger.info(`🛡️ [PhD] Conflito em arquivo Gold Standard: ${file}. Protegendo LOCAL.`);
            return "OURS";
        }

        logger.info(`📡 [PhD] Priorizando UPSTREAM para: ${file}`);
        return "THEIRS";
    }
}
