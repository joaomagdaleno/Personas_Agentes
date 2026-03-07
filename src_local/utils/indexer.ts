/**
 * SISTEMA DE PERSONAS AGENTES - INDEXADOR TÉCNICO
 */
import winston from "winston";
import { Glob } from "bun";

const logger = winston.child({ module: "Indexer" });

export interface FileMetadata {
    classes: string[]; functions: string[]; exports: string[]; lines: number; error?: string;
}

export interface IndexData {
    lastUpdate: string; files: Record<string, FileMetadata>;
    stats: { totalFiles: number; totalClasses: number; totalFunctions: number; totalExports: number; };
}

/**
 * 📑 Indexer — Cataloga a estrutura anatômica do projeto.
 */
export class Indexer {
    constructor(private projectRoot: string) { }

    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana de metadados via Rust Analyzer...");
        const startTime = Date.now();
        const indexData = this.getEmptyIndex();

        try {
            const files = await this.getAuditableFiles();

            if (files.length > 0) {
                const batchRequest = {
                    file_paths: files,
                    project_root: this.projectRoot
                };

                const tmpPath = `${this.projectRoot}/.agent/tmp_batch_${Date.now()}.json`;
                await Bun.write(tmpPath, JSON.stringify(batchRequest));

                const binaryPath = `${this.projectRoot}/src_native/analyzer/target/release/analyzer.exe`;

                const proc = Bun.spawnSync([binaryPath, "batch", tmpPath], {
                    cwd: this.projectRoot,
                    env: { ...process.env },
                });

                import("node:fs").then(fs => {
                    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                });

                if (proc.exitCode !== 0) {
                    throw new Error(`Rust analyzer failed with code ${proc.exitCode}: ${proc.stderr.toString()}`);
                }

                const outputRaw = proc.stdout.toString();
                const processedFiles: any[] = JSON.parse(outputRaw);

                for (const pf of processedFiles) {
                    const metadata: FileMetadata = {
                        classes: pf.classes || [],
                        functions: pf.functions || [],
                        exports: pf.exports || [],
                        lines: pf.lines || 0
                    };
                    this.integrateResult(indexData, pf.path, metadata);
                }
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

    private async getAuditableFiles(): Promise<string[]> {
        const glob = new Glob("**/*.{ts,py}");
        const files: string[] = [];
        for await (const file of glob.scan({ cwd: this.projectRoot, absolute: false })) {
            if (!this._shouldSkip(file)) {
                files.push(file);
            }
        }
        return files;
    }

    private integrateResult(indexData: IndexData, file: string, metadata: FileMetadata) {
        indexData.files[file] = metadata;
        indexData.stats.totalFiles++;
        indexData.stats.totalClasses += metadata.classes.length;
        indexData.stats.totalFunctions += metadata.functions.length;
        indexData.stats.totalExports += metadata.exports.length;
    }

    private isValidPatternMatch(match: RegExpExecArray): boolean {
        return !!match[1] && !match[1].startsWith("_");
    }

    private _shouldSkip(file: string): boolean {
        const skip = ["__pycache__", "node_modules", ".agent", "legacy_restore", "legacy_archive", ".git"];
        return skip.some(s => file.includes(s));
    }
}
