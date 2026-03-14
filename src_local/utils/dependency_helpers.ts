import winston from "winston";

const logger = winston.child({ module: "DependencyHelpers" });

/**
 * Interface for Bun File or similar existence checks
 */
interface Existent {
    exists(): Promise<boolean>;
}

export class DependencyHelpers {
    static async validatePreConditions(agentPath: Existent, lockFile: Existent): Promise<{ ready: boolean }> {
        if (!(await agentPath.exists())) return { ready: false };
        if (await lockFile.exists()) {
            logger.warn("⚠️ Sync bloqueado por LockFile.");
            return { ready: false };
        }
        return { ready: true };
    }

    static handleSyncError(e: unknown, conflictPolicy: any): void {
        const errorMsg = e instanceof Error ? e.message : String(e);
        logger.error(`🚨 Erro Sync: ${errorMsg}`);
        const low = errorMsg.toLowerCase();
        if (low.includes("conflict") || low.includes("merge")) {
            logger.warn("⚔️ Detectado conflito de git. Tentando resolução automática...");
            if (conflictPolicy && typeof conflictPolicy.resolveFile === 'function') {
                conflictPolicy.resolveFile("skills_index.json", () => true);
            }
        }
    }
}
