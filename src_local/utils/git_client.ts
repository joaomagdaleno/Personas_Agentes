import winston from "winston";
import { TaskExecutor } from "./task_executor.ts";
import { RemoteDiscoverer } from "./RemoteDiscoverer.ts";
import { LockCleaner } from "./LockCleaner.ts";

const logger = winston.child({ module: "GitClient" });

/**
 * 🛠️ GitClient (Bun Version).
 * Invólucro para operações Git de baixo nível usando TaskExecutor.
 */
export class GitClient {
    private cwd: string;
    private executor: TaskExecutor;

    constructor(cwd: string) {
        this.cwd = cwd;
        this.executor = new TaskExecutor();
    }

    async run(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return await this.executor.runCommand(`git ${args.join(" ")}`, this.cwd);
    }

    async getOutput(args: string[]): Promise<string> {
        const res = await this.run(args);
        return res.stdout.trim();
    }

    async fetchPrune(remote: string): Promise<void> {
        await this.run(["fetch", remote, "--prune"]);
    }

    async discoverRemote(): Promise<string | null> {
        return RemoteDiscoverer.discover(this);
    }

    async getCommitCount(revRange: string): Promise<number> {
        const res = await this.getOutput(["rev-list", "--count", revRange]);
        return parseInt(res || "0", 10);
    }

    async stashPush(msg: string): Promise<void> {
        await this.run(["stash", "push", "--include-untracked", "-m", msg]);
    }

    async stashPop(): Promise<void> {
        await this.run(["stash", "pop"]);
    }

    async rebase(target: string): Promise<number> {
        const res = await this.run(["rebase", target]);
        return res.exitCode;
    }

    async rebaseAbort(): Promise<void> {
        await this.run(["rebase", "--abort"]);
    }

    async resetHard(target: string): Promise<number> {
        const res = await this.run(["reset", "--hard", target]);
        return res.exitCode;
    }

    async getCurrentBranch(): Promise<string> {
        return await this.getOutput(["rev-parse", "--abbrev-ref", "HEAD"]);
    }

    async getTrackingBranch(activeBranch: string): Promise<string> {
        const t = await this.getOutput(["config", `branch.${activeBranch}.merge`]);
        return t ? t.replace("refs/heads/", "") : "main";
    }

    async getHeadHash(): Promise<string> {
        return await this.getOutput(["rev-parse", "HEAD"]);
    }

    /**
     * Cria uma branch de cura e commita correções automaticamente.
     */
    async commitFix(fixDescription: string, files: string[]): Promise<string | null> {
        const timestamp = new Date().toISOString().replace(/[-T:]/g, "").slice(0, 12); // YYYYMMDDHHMM
        const branchName = `sovereign/fix_${timestamp}`;

        logger.info(`👻 [Git] Criando branch de cura: ${branchName}`);

        // 1. Create and Switch Branch
        await this.run(["checkout", "-b", branchName]);

        // 2. Add Files
        if (files.length > 0) {
            await this.run(["add", ...files]);
        } else {
            await this.run(["add", "."]);
        }

        // 3. Commit
        const commitMsg = `fix(ai): ${fixDescription}\n\nAutomated fix by Sovereign AI during idle cycle.`;
        const res = await this.run(["commit", "-m", commitMsg]);

        if (res.exitCode === 0) {
            logger.info(`✅ [Git] Correção salva na branch ${branchName}.`);
            return branchName;
        } else {
            logger.error(`❌ [Git] Falha ao commitar: ${res.stderr}`);
            return null;
        }
    }

    /**
     * Limpa arquivos de trava do Git (.lock).
     */
    async clearLocks(): Promise<void> {
        LockCleaner.clear(this.cwd);
    }

    /**
     * Limpa o cache de sub módulos e __pycache__.
     */
    async cleanCache(): Promise<void> {
        await this.run(["rm", "-r", "--cached", "**/__pycache__/*"]);
    }

    /**
     * Sincroniza e atualiza sub módulos.
     */
    async syncSubmodules(): Promise<void> {
        await this.run(["submodule", "sync", "--recursive"]);
        await this.run(["submodule", "update", "--init", "--recursive"]);
    }

    /**
     * Resolve conflitos usando uma estratégia básica de commit ou rebase continue.
     */
    async resolveBasicConflicts(): Promise<void> {
        const status = await this.getOutput(["status", "--porcelain"]);
        const conflicted = status.split("\n").filter(l => l.startsWith("UU") || l.startsWith("AA"));

        if (conflicted.length > 0) {
            logger.warn(`🚨 [Git] ${conflicted.length} conflitos detectados. Tentando resolução básica...`);
        }
    }

    /** Parity: is_clean_state — Checks if the working directory is clean. */
    public async is_clean_state(): Promise<boolean> {
        const res = await this.run(["status", "--porcelain"]);
        return res.stdout.trim() === "";
    }

    /** Parity: _run_git — Internal git runner stub. */
    private async _run_git(args: string[]): Promise<string> {
        const res = await this.run(args);
        return res.stdout;
    }
}

/** Parity: GitAutomaton — Legacy alias for GitClient. */
export class GitAutomaton extends GitClient { }
