import winston from "winston";
import { GitClient } from "./git_client.ts";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "GitSyncManager" });

export class GitSyncManager {
    constructor(private git: GitClient, private projectRoot: Path, private agentPath: Path) {}

    async executeGitSync(): Promise<boolean> {
        const remote = await this.git.discoverRemote();
        if (!remote) return false;

        await this.git.rebaseAbort();
        logger.info(`🔄 Sync: ${remote}`);
        await this.git.fetchPrune(remote);

        const target = await this.getTargetRef(remote);
        const commitsBehind = await this.git.getCommitCount(`HEAD..${target}`);

        if (commitsBehind === 0) {
            logger.info("✅ Versão Atualizada.");
            return true;
        }

        return await this.performPull(target, commitsBehind);
    }

    private async getTargetRef(remote: string): Promise<string> {
        const active = await this.git.getCurrentBranch();
        const tracking = await this.git.getTrackingBranch(active);
        return `${remote}/${tracking}`;
    }

    private async performPull(target: string, count: number): Promise<boolean> {
        logger.info(`⬇️ Puxando ${count} commits...`);
        await this.git.stashPush("Auto-sync");
        const rebased = await this.git.rebase(target) === 0;
        const success = rebased || await this.fallbackReset(target);
        return success ? await this.finalizeSync() : false;
    }

    private async fallbackReset(target: string): Promise<boolean> {
        logger.warn(`⚠️ Reset Hard para ${target}`);
        await this.git.rebaseAbort();
        return await this.git.resetHard(target) === 0;
    }

    private async finalizeSync(): Promise<boolean> {
        await this.gitAddSkills();
        await this.git.stashPop();
        logger.info("✨ Sync Sucesso.");
        return true;
    }

    private async gitAddSkills(): Promise<void> {
        const proc = Bun.spawn(["git", "add", ".agent/skills"], { cwd: this.projectRoot.toString() });
        await proc.exited;
    }
}
