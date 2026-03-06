import winston from "winston";
import * as cp from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "ContextMappingLogic" });

/**
 * Lógica de Mapeamento de Contexto (Rust-Enhanced).
 */
export class ContextMappingLogic {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");
    public metadataCache: Record<string, any> = {};

    async processBatch(scanner: any, engine: any, goMap: Record<string, any> = {}): Promise<Record<string, string>> {
        const startTime = Date.now();
        const contentCache: Record<string, string> = {};

        const filePaths = await this.getAllFiles(scanner);

        if (fs.existsSync(ContextMappingLogic.BINARY_PATH) && filePaths.length > 5) {
            try {
                const results = await this.processBatchRust(filePaths, engine.projectRoot);
                for (const res of results) {
                    contentCache[res.path] = res.content;
                    this.metadataCache[res.path] = {
                        dna: res.dna,
                        semantic_blocks: res.semantic_blocks
                    };
                    if (res.dna.length > 0) {
                        logger.debug(`DNA detected for ${res.path}: ${res.dna.join(", ")}`);
                    }
                }
            } catch (err) {
                logger.warn("Rust batch processing failed, falling back to TypeScript", { error: err });
                await this.readFilesIntoCache(filePaths, engine, contentCache);
            }
        } else {
            await this.readFilesIntoCache(filePaths, engine, contentCache);
        }

        await this.registerAllFiles(contentCache, engine, goMap);

        const duration = (Date.now() - startTime) / 1000;
        logger.info(`Telemetry: Context batch processing (Rust-Parallel) in ${duration.toFixed(4)}s for ${filePaths.length} files`);
        return contentCache;
    }

    private async processBatchRust(filePaths: any[], projectRoot: any): Promise<any[]> {
        const request = {
            file_paths: filePaths.map(p => p.relativeTo(projectRoot)),
            project_root: projectRoot.toString()
        };

        const tmpFile = path.join(process.cwd(), `tmp_batch_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(request));

        try {
            const output = cp.execSync(`${ContextMappingLogic.BINARY_PATH} batch ${tmpFile}`, {
                encoding: "utf8",
                maxBuffer: 200 * 1024 * 1024 // 200MB for large projects
            });
            return JSON.parse(output);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    }

    private async getAllFiles(scanner: any): Promise<any[]> {
        const filePaths: any[] = [];
        for await (const path of scanner.getAnalyzableFiles()) {
            filePaths.push(path);
        }
        return filePaths;
    }

    private async readFilesIntoCache(filePaths: any[], engine: any, contentCache: Record<string, string>) {
        const concurrencyLimit = 20;
        for (let i = 0; i < filePaths.length; i += concurrencyLimit) {
            const batch = filePaths.slice(i, i + concurrencyLimit);
            await Promise.all(batch.map(async (path) => {
                await this.readFile(path, engine, contentCache);
            }));
        }
    }

    private async readFile(path: any, engine: any, contentCache: Record<string, string>) {
        try {
            const rel = path.relativeTo(engine.projectRoot);
            contentCache[rel] = await Bun.file(path.toString()).text();
        } catch (e) {
            logger.warn(`Failed to read ${path.toString()}: ${e}`);
        }
    }

    private async registerAllFiles(contentCache: Record<string, string>, engine: any, goMap: Record<string, any>) {
        for (const relPath in contentCache) {
            const normRel = relPath.replace(/\\/g, "/");
            await engine.registerFile(engine.projectRoot.join(relPath), false, goMap[normRel]);
        }
    }

    getInitialInfo(path: Path, relPath: string, analyst: any): any {
        const compType = analyst.mapComponentType(relPath);
        return {
            purpose: "Logic",
            functions: [],
            classes: [],
            brittle: false,
            silent_error: false,
            has_test: false,
            component_type: compType,
            domain: compType === "TEST" ? "EXPERIMENTATION" : "PRODUCTION",
            path: path.toString(),
            rel_path: relPath
        };
    }

    /** Parity: _pre_read_files — Pre-reads a list of files into a content cache. */
    async _pre_read_files(filePaths: string[]): Promise<Record<string, string>> {
        const cache: Record<string, string> = {};
        await Promise.all(filePaths.map(async (fp) => {
            try {
                cache[fp] = await Bun.file(fp).text();
            } catch {
                logger.warn(`⚠️ [ContextMappingLogic] Falha ao pré-ler: ${fp}`);
            }
        }));
        return cache;
    }
}
