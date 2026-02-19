import winston from "winston";
const logger = winston.child({ module: "DependencyHelpers" });

export class DependencyHelpers {
    static async validatePreConditions(agentPath: any, lockFile: any): Promise<{ ready: boolean }> {
        if (!(await agentPath.exists())) return { ready: false };
        if (await lockFile.exists()) {
            logger.warn("⚠️ Sync bloqueado por LockFile.");
            return { ready: false };
        }
        return { ready: true };
    }

    static handleSyncError(e: any, conflictPolicy: any): void {
        logger.error(`🚨 Erro Sync: ${e}`);
        const low = (e.message || "").toLowerCase();
        if (low.includes("conflict") || low.includes("merge")) {
            logger.warn("⚔️ Detectado conflito de git. Tentando resolução automática...");
            conflictPolicy.resolveFile("skills_index.json", () => true);
        }
    }
}
