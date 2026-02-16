import * as fs from "node:fs/promises";
import winston from "winston";
import { GitClient } from "./git_client.ts";

const logger = winston.child({ module: "SubmoduleSyncLogic" });

/**
 * 🔄 Lógica de Sincronia de Submódulos (Bun Version).
 * Centraliza validações de trava (lock) e deltas de commit.
 */
export class SubmoduleSyncLogic {
    async isLocked(lockPath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(lockPath).catch(() => null);
            if (!stats) return false;

            const mtime = stats.mtime;
            const diffMinutes = (Date.now() - mtime.getTime()) / (1000 * 60);

            if (diffMinutes > 10) {
                await fs.unlink(lockPath).catch(() => { });
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    async getSubmoduleDelta(git: GitClient, remote: string | null): Promise<any[]> {
        const startTime = Date.now();

        if (!remote) return [];

        try {
            await git.run(["fetch", remote]);
            const active = await git.getCurrentBranch();
            const tracking = await git.getTrackingBranch(active);

            const delta = await git.getCommitCount(`${active}..${remote}/${tracking}`);

            if (delta > 0) {
                const duration = (Date.now() - startTime) / 1000;
                logger.info(`Telemetry: Submodule delta check completed in ${duration.toFixed(4)}s`);
                return [{
                    file: ".agent/skills",
                    issue: `Delta: ${delta} commits pendentes no submódulo.`,
                    severity: "CRITICAL",
                    context: "DependencyAuditor"
                }];
            }
        } catch (e) {
            logger.warn(`⚠️ Erro ao verificar delta de submódulo: ${e}`);
        }

        return [];
    }
}
