import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { ForbiddenPolicy } from "./ForbiddenPolicy.ts";

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
        await this.walkFiles(this.root.toString(), files);
        return files;
    }

    private async walkFiles(dir: string, files: string[]) {
        if (ForbiddenPolicy.isForbiddenDir(dir)) return;
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = join(dir, entry.name);
            if (entry.isDirectory()) await this.walkFiles(res, files);
            else files.push(entry.name.toLowerCase());
        }
    }

    async *getAnalyzableFiles(): AsyncGenerator<Path> {
        const seen = new Set<string>();
        const generator = this._walkAndYield(this.root.toString());

        for await (const pathStr of generator) {
            const path = new Path(pathStr);
            if (!seen.has(pathStr) && !(await this.shouldSkip(path))) {
                seen.add(pathStr);
                yield path;
            }
        }
    }

    private async * _walkAndYield(dir: string): AsyncGenerator<string> {
        if (ForbiddenPolicy.isForbiddenDir(dir)) return;
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const res = join(dir, entry.name);
            if (entry.isDirectory()) yield* this._walkAndYield(res);
            else yield res;
        }
    }

    async shouldSkip(path: Path): Promise<boolean> {
        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();
        const checks = [
            async () => !(await path.isFile()),
            async () => ForbiddenPolicy.isForbiddenDir(dirname(pathStr)),
            async () => pathStr.includes("/.agent/") && !pathStr.includes("fast-android-build"),
            async () => !pathStr.includes("src_local") && this.analyst.shouldIgnore(path),
            async () => !this.analyst.isAnalyable(path)
        ];
        for (const check of checks) if (await check()) return true;
        return false;
    }
}
