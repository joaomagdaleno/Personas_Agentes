import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "ContextMappingLogic" });

/**
 * Lógica de Mapeamento de Contexto (Bun Version).
 */
export class ContextMappingLogic {
    async processBatch(scanner: any, engine: any): Promise<Record<string, string>> {
        const startTime = Date.now();
        const contentCache: Record<string, string> = {};
        const filePaths: any[] = [];

        for await (const path of scanner.getAnalyzableFiles()) {
            filePaths.push(path);
        }

        // Processamento em paralelo limitado (Bun é rápido, mas evitamos estourar descritores)
        const concurrencyLimit = 20;
        for (let i = 0; i < filePaths.length; i += concurrencyLimit) {
            const batch = filePaths.slice(i, i + concurrencyLimit);
            await Promise.all(batch.map(async (path) => {
                try {
                    const rel = path.relativeTo(engine.projectRoot);
                    contentCache[rel] = await Bun.file(path.toString()).text();
                } catch (e) {
                    logger.warn(`Failed to read ${path.toString()}: ${e}`);
                }
            }));
        }

        for (const relPath in contentCache) {
            await engine.registerFile(engine.projectRoot.join(relPath));
        }

        const duration = (Date.now() - startTime) / 1000;
        logger.info(`Telemetry: Context batch processing (parallel) in ${duration.toFixed(4)}s`);
        return contentCache;
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
