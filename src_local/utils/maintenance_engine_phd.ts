
import { join } from "path";
import { existsSync } from "fs";
import winston from "winston";
import { GitClient } from "./git_client";

const logger = winston.child({ module: "MaintenanceEnginePhD" });

export class MaintenanceEnginePhd {
    /**
     * Limpeza recursiva de submódulos.
     */
    static async cleanSubmodules(root: string, git: GitClient): Promise<void> {
        const displayPaths = await git.run(["submodule", "foreach", "--quiet", "echo $displaypath"]);

        if (displayPaths && displayPaths.exitCode === 0 && displayPaths.stdout) {
            const submodules = displayPaths.stdout.split("\n").filter(s => s.trim() !== "");
            for (const sub of submodules) {
                await this.cleanSingleSubmodule(root, sub.trim());
            }
        }
    }

    private static async cleanSingleSubmodule(root: string, sub: string): Promise<void> {
        const subPath = join(root, sub);
        if (existsSync(subPath)) {
            logger.info(`🧹 [Maintenance] Limpando submódulo: ${sub}`);
            await Bun.spawn(["git", "clean", "-fd"], { cwd: subPath }).exited;
        }
    }

    /**
     * Merge inteligente do índice de skills (JSON), preservando IDs protegidos.
     */
    static async mergeSkillsIndex(root: string, filePath: string, git: GitClient, protectedIds: string[]): Promise<boolean> {
        try {
            const ours = await this.getGitVersion(root, filePath, 2);
            const theirs = await this.getGitVersion(root, filePath, 3);

            const mergedMap = this.performSkillsMerge(ours, theirs, protectedIds);
            const result = Array.from(mergedMap.values()).sort((a, b) => (a.id || "").localeCompare(b.id || ""));

            await Bun.write(join(root, filePath), JSON.stringify(result, null, 2));
            return true;
        } catch (error) {
            logger.error(`❌ [Maintenance] Falha no merge de skills: ${error}`);
            return false;
        }
    }

    private static async getGitVersion(root: string, filePath: string, stage: number): Promise<any[]> {
        try {
            const res = await Bun.spawn(["git", "show", `:${stage}:${filePath}`], { cwd: root, stdout: "pipe" });
            const text = await new Response(res.stdout).text();
            return JSON.parse(text);
        } catch {
            logger.debug(`⚠️ Maintenance: Failed to parse stage ${stage} version of ${filePath}.`);
            return [];
        }
    }

    private static performSkillsMerge(ours: any[], theirs: any[], protectedIds: string[]): Map<string, any> {
        const mergedMap = new Map<string, any>();

        for (const item of theirs) {
            this.setIfHasId(mergedMap, item);
        }

        for (const item of ours) {
            this.setIfProtected(mergedMap, item, protectedIds);
        }

        return mergedMap;
    }

    private static setIfHasId(map: Map<string, any>, item: any) {
        if (item.id) map.set(item.id, item);
    }

    private static setIfProtected(map: Map<string, any>, item: any, protectedIds: string[]) {
        if (item.id && protectedIds.includes(item.id)) {
            map.set(item.id, item);
        }
    }
}
