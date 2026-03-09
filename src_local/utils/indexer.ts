import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "Indexer" });

export interface FileMetadata {
    classes: string[]; functions: string[]; exports: string[]; lines: number; error?: string;
}

export interface IndexData {
    lastUpdate: string; files: Record<string, FileMetadata>;
    stats: { totalFiles: number; totalClasses: number; totalFunctions: number; totalExports: number; };
}

/**
 * 📑 Indexer — Cataloga a estrutura anatômica do projeto via gRPC Proxy (Go Hub).
 */
export class Indexer {
    constructor(private projectRoot: string, private hubManager?: HubManagerGRPC) { }

    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana via Hub Proxy (gRPC)...");
        const startTime = Date.now();
        const indexData = this.getEmptyIndex();

        if (!this.hubManager) {
            logger.warn("⚠️ HubManager not provided to Indexer. Returning empty index.");
            return indexData;
        }

        try {
            const processedFiles = await this.hubManager.indexProject(this.projectRoot);

            if (!processedFiles || !Array.isArray(processedFiles)) {
                throw new Error(`Invalid response from Hub indexer.`);
            }

            for (const pf of processedFiles) {
                const metadata: FileMetadata = {
                    classes: pf.classes || [],
                    functions: pf.functions || [],
                    exports: pf.exports || [],
                    lines: pf.lines || 0
                };
                this.integrateResult(indexData, pf.path, metadata);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logger.info(`✅ Indexação nativa concluída: ${indexData.stats.totalFiles} módulos em ${duration}s.`);
        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor de indexação: ${e.message}`);
        }
        return indexData;
    }

    private getEmptyIndex(): IndexData {
        return {
            lastUpdate: new Date().toISOString(), files: {},
            stats: { totalFiles: 0, totalClasses: 0, totalFunctions: 0, totalExports: 0 },
        };
    }

    private integrateResult(indexData: IndexData, file: string, metadata: FileMetadata) {
        indexData.files[file] = metadata;
        indexData.stats.totalFiles++;
        indexData.stats.totalClasses += metadata.classes.length;
        indexData.stats.totalFunctions += metadata.functions.length;
        indexData.stats.totalExports += metadata.exports.length;
    }
}

