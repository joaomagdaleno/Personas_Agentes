
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
        // List submodules
        const displayPaths = await git.run(["submodule", "foreach", "--quiet", "echo $displaypath"]);

        if (displayPaths && displayPaths.exitCode === 0 && displayPaths.stdout) {
            const submodules = displayPaths.stdout.split("\n").filter(s => s.trim() !== "");

            for (const sub of submodules) {
                const subPath = join(root, sub.trim());
                if (existsSync(subPath)) {
                    logger.info(`🧹 [Maintenance] Limpando submódulo: ${sub}`);
                    // Execute git clean -fd in submodule explicitly
                    await Bun.spawn(["git", "clean", "-fd"], { cwd: subPath }).exited;
                }
            }
        }
    }

    /**
     * Merge inteligente do índice de skills (JSON), preservando IDs protegidos.
     */
    static async mergeSkillsIndex(root: string, filePath: string, git: GitClient, protectedIds: string[]): Promise<boolean> {
        try {
            // Get version from stage 2 (ours) and stage 3 (theirs)
            // Note: GitClient usually runs in root
            const oursRes = await Bun.spawn(["git", "show", `:2:${filePath}`], { cwd: root, stdout: "pipe" });
            const theirsRes = await Bun.spawn(["git", "show", `:3:${filePath}`], { cwd: root, stdout: "pipe" });

            const oursText = await new Response(oursRes.stdout).text();
            const theirsText = await new Response(theirsRes.stdout).text();

            let ours: any[] = [];
            let theirs: any[] = [];
            try { ours = JSON.parse(oursText); } catch { }
            try { theirs = JSON.parse(theirsText); } catch { }

            // Merge Logic: Base is THEIRS, but override with OURS if protected
            // Use Map for O(1) lookups
            const mergedMap = new Map<string, any>();

            // 1. Populate with Theirs
            for (const item of theirs) {
                if (item.id) mergedMap.set(item.id, item);
            }

            // 2. Override with Ours if Protected
            for (const item of ours) {
                if (item.id && protectedIds.includes(item.id)) {
                    mergedMap.set(item.id, item);
                }
            }

            // 3. Keep ours if missing in theirs (Optional? Legacy preserved ours if missing? No, logic was "merged = theirs, override with ours". If ours not in theirs, it was lost unless protected.)
            // Legacy Logic: merged = {item['id']: item for item in theirs} => Base is THEIRS
            // for item in ours: if protected: create/override.

            // So if item is in Ours but NOT in Theirs, and is protected => It is KEPT.
            // If item is in Ours but NOT in Theirs, and NOT protected => It is LOST (deleted in Theirs).
            // This matches Git merge logic for "theirs" strategy usually, but with exceptions.

            // 3. Write back sorted
            const result = Array.from(mergedMap.values()).sort((a, b) => (a.id || "").localeCompare(b.id || ""));

            await Bun.write(join(root, filePath), JSON.stringify(result, null, 2));
            return true;

        } catch (error) {
            logger.error(`❌ [Maintenance] Falha no merge de skills: ${error}`);
            return false;
        }
    }
}
