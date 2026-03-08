import winston from "winston";
import { Path } from "../core/path_utils.ts";
import { HubManagerGRPC } from "../core/hub_manager_grpc";

const logger = winston.child({ module: "ContextMappingLogic" });

/**
 * Lógica de Mapeamento de Contexto (gRPC Proxy).
 */
export class ContextMappingLogic {
    public metadataCache: Record<string, any> = {};

    constructor(private hubManager?: HubManagerGRPC) { }

    async processBatch(scanner: any, engine: any, goMap: Record<string, any> = {}): Promise<Record<string, string>> {
        const startTime = Date.now();
        const contentCache: Record<string, string> = {};

        const filePaths = await this.getAllFiles(scanner);

        if (this.hubManager && filePaths.length > 5) {
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
                logger.warn("gRPC batch processing failed, falling back to TypeScript", { error: err });
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

        if (!this.hubManager) return [];
        return await this.hubManager.batch(request);
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
