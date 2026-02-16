import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join, dirname } from "node:path";

const logger = winston.child({ module: "FileSystemScanner" });

/**
 * Gerenciador de descoberta de arquivos no sistema (Bun Version).
 */
export class FileSystemScanner {
    root: Path;
    analyst: any;

    constructor(root: string, analyst: any) {
        this.root = new Path(root);
        this.analyst = analyst;
        logger.debug(`FileSystemScanner initialized for root: ${this.root.toString()}`);
    }

    async scanAllFilenames(): Promise<string[]> {
        const files: string[] = [];
        const walk = async (dir: string) => {
            if (this.isForbiddenDir(dir)) return;

            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const res = join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(res);
                } else {
                    files.push(entry.name.toLowerCase());
                }
            }
        };
        await walk(this.root.toString());
        return files;
    }

    private isForbiddenDir(dir: string): boolean {
        const normalized = dir.replace(/\\/g, "/").toLowerCase();

        // 🛡️ Robust Check: Explicitly block node_modules and .git independent of relative logic
        if (normalized.includes("node_modules") || normalized.includes("/.git") || normalized === ".git") {
            // Check segments strictly to avoid blocking "my_node_modules_test" etc if that was valid
            const segments = normalized.split("/");
            if (segments.includes("node_modules") || segments.includes(".git")) {
                // console.log(`🛡️ [FileSystemScanner] Blocking forbidden dir: ${dir}`); 
                return true;
            }
        }

        const rootPath = this.root.toString().replace(/\\/g, "/").toLowerCase();

        const relPath = normalized.startsWith(rootPath)
            ? normalized.slice(rootPath.length).replace(/^\//, "")
            : normalized;

        const parts = relPath.split("/");

        const forbidden = [".git", ".gemini", "restore", "forensics", "__pycache__", "node_modules", ".venv", "dist", "build"];
        if (parts.some(p => forbidden.includes(p))) return true;

        if (parts.includes(".agent")) {
            if (normalized.includes("fast-android-build")) return false;

            // Permitimos descer a árvore se estivermos no caminho para as skills
            // .agent -> skills -> skills -> [skill]
            const sub = parts.slice(parts.indexOf(".agent"));
            const allowedHierarchy = [".agent", "skills"];
            if (sub.every(p => allowedHierarchy.includes(p))) return false;

            return true;
        }

        return false;
    }

    async *getAnalyzableFiles(): AsyncGenerator<Path> {
        const searchDirs = [this.root.toString()];
        const seen = new Set<string>();

        const self = this;
        for (const d of searchDirs) {
            const walk = async function* (dir: string): AsyncGenerator<string> {
                if (self.isForbiddenDir(dir)) return;

                const entries = await readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const res = join(dir, entry.name);
                    if (entry.isDirectory()) {
                        yield* walk(res);
                    } else {
                        yield res;
                    }
                }
            };

            for await (const pathStr of walk(d)) {
                const path = new Path(pathStr);
                if (seen.has(path.toString())) continue;

                if (await this.shouldSkip(path)) continue;

                seen.add(path.toString());
                yield path;
            }
        }
    }

    async shouldSkip(path: Path): Promise<boolean> {
        if (!(await path.isFile())) return true;

        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();
        const dirPath = dirname(path.toString());

        if (this.isForbiddenDir(dirPath)) return true;

        // Bloqueio cirúrgico: se estiver no .agent, só entra se for fast-android-build
        const p = pathStr.toLowerCase();
        if ((p.includes("/.agent/") || p.startsWith(".agent/")) && !p.includes("fast-android-build")) {
            return true;
        }

        const isSrc = pathStr.includes("src_local");
        // analyst.shouldIgnore pode ter regras próprias (ex: .log, .tmp)
        if (this.analyst.shouldIgnore(path) && !isSrc) return true;
        if (!this.analyst.isAnalyable(path)) return true;

        return false;
    }
}
