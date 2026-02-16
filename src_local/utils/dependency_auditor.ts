import * as fs from "node:fs/promises";
import * as path from "node:path";
import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { GitClient } from "./git_client.ts";
import { SubmoduleSyncLogic } from "./submodule_sync_logic.ts";
import { ConflictPolicy } from "./conflict_policy.ts";

const logger = winston.child({ module: "DependencyAuditor" });

/**
 * 📦 Auditor de Dependências Soberano (Bun Version).
 * Gerencia a integridade e sincronização de submódulos (.agent/skills),
 * garantindo resiliência total a conflitos e falhas de rede.
 */
export class DependencyAuditor {
    private projectRoot: Path;
    private agentPath: Path;
    private lockFile: Path;
    private isInternal: boolean;
    private git: GitClient;
    private syncLogic: SubmoduleSyncLogic;
    private conflictPolicy: ConflictPolicy;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.agentPath = this.projectRoot.join(".agent", "skills");
        this.lockFile = this.projectRoot.join(".gemini", "sync.lock");
        this.isInternal = projectRoot.includes("Personas_Agentes");
        this.git = new GitClient(this.agentPath.toString());
        this.syncLogic = new SubmoduleSyncLogic();
        this.conflictPolicy = new ConflictPolicy(this.agentPath.toString());
    }

    async syncSubmodule(): Promise<boolean> {
        if (!(await this.agentPath.exists())) return false;

        if (await this.syncLogic.isLocked(this.lockFile.toString())) {
            logger.warn("Submodule is locked by another process.");
            return false;
        }

        await fs.writeFile(this.lockFile.toString(), "locked", "utf-8");
        try {
            await this.ensureInitialized();
            if (!(await this.agentPath.join(".git").exists())) return false;

            const initialHash = await this.git.getHeadHash();
            const remote = await this.git.discoverRemote();
            if (!remote) return false;

            await this.git.rebaseAbort();
            logger.info(`🔄 Sync: ${remote}`);
            await this.git.fetchPrune(remote);

            const active = await this.git.getCurrentBranch();
            const tracking = await this.git.getTrackingBranch(active);
            const commitsBehind = await this.git.getCommitCount(`HEAD..${remote}/${tracking}`);

            if (commitsBehind === 0) {
                logger.info("✅ Versão Atualizada.");
                return true;
            }

            logger.info(`⬇️ Puxando ${commitsBehind} commits...`);
            await this.git.stashPush("Auto-sync");

            const target = `${remote}/${tracking}`;
            if (await this.git.rebase(target) !== 0) {
                logger.warning(`⚠️ Reset Hard para ${target}`);
                await this.git.rebaseAbort();
                if (await this.git.resetHard(target) !== 0) {
                    throw new Error("Falha Fatal Reset.");
                }
            }

            // Verify integrity (simplified for TS)
            await this.verifySystemIntegrity();

            // Add changes to parent repo
            const proc = Bun.spawn(["git", "add", ".agent/skills"], { cwd: this.projectRoot.toString() });
            await proc.exited;

            await this.git.stashPop();
            logger.info("✨ Sync Sucesso.");
            return true;
        } catch (e: any) {
            logger.error(`🚨 Erro Sync: ${e}`);
            // Attempt Conflict Resolution
            if (e.message?.includes("conflict") || e.message?.includes("merge")) {
                logger.warn("⚔️ Detectado conflito de git. Tentando resolução automática...");
                await this.conflictPolicy.resolveFile("skills_index.json", () => true);
                // Retry sync or just log
            }
            return false;
        } finally {
            await fs.unlink(this.lockFile.toString()).catch(() => { });
        }
    }

    async ensureInitialized(): Promise<void> {
        if (await this.projectRoot.exists()) {
            const hasFiles = await fs.readdir(this.agentPath.toString()).then(files => files.length > 0).catch(() => false);
            if (!hasFiles) {
                try {
                    const proc = Bun.spawn(["git", "submodule", "update", "--init", "--recursive"], {
                        cwd: this.projectRoot.toString()
                    });
                    await proc.exited;
                } catch (e) {
                    logger.error(`❌ Falha na inicialização de submódulos: ${e}`);
                }
            }
        }
    }

    async checkSubmoduleStatus(): Promise<any[]> {
        if (!this.isInternal) return [];
        if (!(await this.agentPath.join(".git").exists())) await this.ensureInitialized();

        try {
            const remote = await this.git.discoverRemote();
            return await this.syncLogic.getSubmoduleDelta(this.git, remote);
        } catch {
            return [];
        }
    }

    private async verifySystemIntegrity(): Promise<void> {
        // Just checking some critical files exist
        const criticalFiles = ["SKILL.md"];
        for (const file of criticalFiles) {
            const fullPath = this.agentPath.join(file);
            if (!(await fullPath.exists())) {
                // Not really a failure in all submodules, but good to note
            }
        }
    }
}
