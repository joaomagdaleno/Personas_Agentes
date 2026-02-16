import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { readdir } from "node:fs/promises";
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
        const segments = normalized.split("/");

        // Check for forbidden directories using Set for O(1) lookups
        const forbidden = new Set([".git", ".gemini", "restore", "forensics", "__pycache__", "node_modules", ".venv", "dist", "build"]);
        if (segments.some(p => forbidden.has(p))) {
            return true;
        }

        // Handle .agent directory rules
        if (segments.includes(".agent")) {
            if (normalized.includes("fast-android-build")) {
                return false;
            }

            const sub = segments.slice(segments.indexOf(".agent"));
            const allowedHierarchy = new Set([".agent", "skills"]);
            if (sub.every(p => allowedHierarchy.has(p))) {
                return false;
            }

            return true;
        }

        return false;
    }

    async *getAnalyzableFiles(): AsyncGenerator<Path> {
        const seen = new Set<string>();

        const walk = async function* (this: FileSystemScanner, dir: string): AsyncGenerator<string> {
            if (this.isForbiddenDir(dir)) return;

            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const res = join(dir, entry.name);
                if (entry.isDirectory()) {
                    yield* walk.call(this, res);
                } else {
                    yield res;
                }
            }
        };

        for await (const pathStr of walk.call(this, this.root.toString())) {
            if (seen.has(pathStr)) continue;

            const path = new Path(pathStr);

            if (await this.shouldSkip(path)) {
                continue;
            }

            seen.add(pathStr);
            yield path;
        }
    }

    async shouldSkip(path: Path): Promise<boolean> {
        if (!(await path.isFile())) {
            return true;
        }

        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();
        const dirPath = dirname(pathStr);

        if (this.isForbiddenDir(dirPath)) {
            return true;
        }

        // Strict check for .agent directory
        if ((pathStr.includes("/.agent/") || pathStr.startsWith(".agent/")) && !pathStr.includes("fast-android-build")) {
            return true;
        }

        const isSrc = pathStr.includes("src_local");
        if (this.analyst.shouldIgnore(path) && !isSrc) {
            return true;
        }

        if (!this.analyst.isAnalyable(path)) {
            return true;
        }

        return false;
    }
}
