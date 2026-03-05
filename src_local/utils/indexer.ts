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
    constructor(private projectRoot: string) {}

    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana de metadados...");
        const startTime = Date.now();
        const indexData = this.getEmptyIndex();

        try {
            const files = await this.getAuditableFiles();
            const results = await Promise.allSettled(files.map(f => this.processFile(f)));
            this.consolidateResults(indexData, results);

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logger.info(`✅ Indexação concluída: ${indexData.stats.totalFiles} módulos em ${duration}s.`);
        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor de indexação: ${e.message}`);
        }
        return indexData;
    }

    private consolidateResults(indexData: IndexData, results: PromiseSettledResult<{ file: string; metadata: FileMetadata }>[]) {
        for (const result of results) {
            if (result.status === "fulfilled") {
                this.integrateResult(indexData, result.value.file, result.value.metadata);
            }
        }
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

    private async processFile(file: string) {
        const fullPath = `${this.projectRoot}/${file}`;
        const metadata = await this._extractMetadata(fullPath);
        return { file, metadata };
    }

    private integrateResult(indexData: IndexData, file: string, metadata: FileMetadata) {
        indexData.files[file] = metadata;
        indexData.stats.totalFiles++;
        indexData.stats.totalClasses += metadata.classes.length;
        indexData.stats.totalFunctions += metadata.functions.length;
        indexData.stats.totalExports += metadata.exports.length;
    }

    private async _extractMetadata(filePath: string): Promise<FileMetadata> {
        try {
            const content = await Bun.file(filePath).text();
            const classes = this._extractPattern(content, /(?:export\s+)?class\s+(\w+)/g);
            const functions = this._extractPattern(content, /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
            const exports = this._extractPattern(content, /export\s+(?:const|let|var|class|function|interface|type|enum)\s+(\w+)/g);

            if (filePath.endsWith(".py")) {
                this.enrichPythonMetadata(content, classes, functions);
            }
            return { classes, functions, exports, lines: content.split("\n").length };
        } catch (e: any) {
            logger.warn(`⚠️ Falha na anatomia de ${filePath}: ${e.message}`);
            return { classes: [], functions: [], exports: [], lines: 0, error: e.message };
        }
    }

    private enrichPythonMetadata(content: string, classes: string[], functions: string[]) {
        const pyClasses = this._extractPattern(content, /^class\s+(\w+)/gm);
        const pyFunctions = this._extractPattern(content, /^(?:async\s+)?def\s+(\w+)/gm);

        pyClasses.filter(c => !classes.includes(c)).forEach(c => classes.push(c));
        pyFunctions.filter(f => !functions.includes(f)).forEach(f => functions.push(f));
    }

    private _extractPattern(content: string, regex: RegExp): string[] {
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (this.isValidPatternMatch(match)) {
                matches.push(match[1]);
            }
        }
        return matches;
    }

    private isValidPatternMatch(match: RegExpExecArray): boolean {
        return !!match[1] && !match[1].startsWith("_");
    }

    private _shouldSkip(file: string): boolean {
        const skip = ["__pycache__", "node_modules", ".agent", "legacy_restore", "legacy_archive", ".git"];
        return skip.some(s => file.includes(s));
    }
}
