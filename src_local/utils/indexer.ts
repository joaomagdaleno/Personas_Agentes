/**
 * SISTEMA DE PERSONAS AGENTES - INDEXADOR TÉCNICO
 * Delegação total ao Rust Analyzer (walkdir + memmap2).
 */
import winston from "winston";
import * as path from "node:path";

const logger = winston.child({ module: "Indexer" });

export interface FileMetadata {
    classes: string[]; functions: string[]; exports: string[]; lines: number; error?: string;
}

export interface IndexData {
    lastUpdate: string; files: Record<string, FileMetadata>;
    stats: { totalFiles: number; totalClasses: number; totalFunctions: number; totalExports: number; };
}

/**
 * 📑 Indexer — Cataloga a estrutura anatômica do projeto via Rust nativo.
 */
export class Indexer {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    constructor(private projectRoot: string) { }

    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana via Rust Analyzer (walkdir + memmap2)...");
        const startTime = Date.now();
        const indexData = this.getEmptyIndex();

        try {
            const proc = Bun.spawnSync([Indexer.BINARY_PATH, "index", this.projectRoot], {
                cwd: this.projectRoot,
                env: { ...process.env },
            });

            if (proc.exitCode !== 0) {
                throw new Error(`Rust analyzer index failed: ${proc.stderr.toString()}`);
            }

            const processedFiles: any[] = JSON.parse(proc.stdout.toString());

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

