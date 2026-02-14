import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";

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

    async *getAnalyzableFiles(): AsyncGenerator<Path> {
        const searchDirs = [this.root.toString()];
        const src = this.root.join("src_local");
        if (await src.exists()) searchDirs.push(src.toString());

        const seen = new Set<string>();

        for (const d of searchDirs) {
            const walk = async function* (dir: string): AsyncGenerator<string> {
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

        const forbidden = [".git", ".gemini", "restore", "Forensics", "__pycache__", "node_modules", ".venv"];
        const pathStr = path.toString().toLowerCase().replace(/\\/g, "/");

        if (forbidden.some(f => pathStr.includes(`/${f.toLowerCase()}/`) || pathStr.endsWith(`/${f.toLowerCase()}`))) {
            return true;
        }

        const isSrc = pathStr.includes("src_local");
        if (this.analyst.shouldIgnore(path) && !isSrc) return true;
        if (!this.analyst.isAnalyable(path)) return true;

        return false;
    }
}
