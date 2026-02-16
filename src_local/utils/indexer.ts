/**
 * SISTEMA DE PERSONAS AGENTES - INDEXADOR TÉCNICO
 * Módulo: Indexador de Metadados (Indexer)
 * Função: Gerar o mapa de conhecimento estrutural (classes/funções).
 * Soberania: CORE-UTILITY.
 */
import winston from "winston";
import { Glob } from "bun";

const logger = winston.child({ module: "Indexer" });

export interface FileMetadata {
    classes: string[];
    functions: string[];
    exports: string[];
    lines: number;
    error?: string;
}

export interface IndexData {
    lastUpdate: string;
    files: Record<string, FileMetadata>;
    stats: {
        totalFiles: number;
        totalClasses: number;
        totalFunctions: number;
        totalExports: number;
    };
}

/**
 * 📑 Indexer — Cataloga a estrutura anatômica do projeto.
 *
 * Responsabilidades:
 * 1. Varredura Estrutural: Identifica todos os componentes TS/PY do ecossistema
 * 2. Extração de Consciência: Mapeia classes e funções
 * 3. Persistência de Conhecimento: Mantém o índice sincronizado
 */
export class Indexer {
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * 📑 Atualiza o índice global de metadados técnicos do projeto.
     */
    async updateIndex(): Promise<IndexData> {
        logger.info("📡 Iniciando indexação soberana de metadados...");
        const startTime = Date.now();

        const indexData: IndexData = {
            lastUpdate: new Date().toISOString(),
            files: {},
            stats: { totalFiles: 0, totalClasses: 0, totalFunctions: 0, totalExports: 0 },
        };

        try {
            const glob = new Glob("**/*.{ts,py}");
            const files: string[] = [];

            for await (const file of glob.scan({ cwd: this.projectRoot, absolute: false })) {
                // Veto de Escopo: Ignora infraestrutura
                if (this._shouldSkip(file)) continue;
                files.push(file);
            }

            // Processar em paralelo usando Bun
            const results = await Promise.allSettled(
                files.map(async (file) => {
                    const fullPath = `${this.projectRoot}/${file}`;
                    const metadata = await this._extractMetadata(fullPath);
                    return { file, metadata };
                })
            );

            for (const result of results) {
                if (result.status === "fulfilled") {
                    const { file, metadata } = result.value;
                    indexData.files[file] = metadata;
                    indexData.stats.totalFiles++;
                    indexData.stats.totalClasses += metadata.classes.length;
                    indexData.stats.totalFunctions += metadata.functions.length;
                    indexData.stats.totalExports += metadata.exports.length;
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            logger.info(`✅ Indexação concluída: ${indexData.stats.totalFiles} módulos em ${duration}s.`);
        } catch (e: any) {
            logger.error(`🚨 Falha crítica no motor de indexação: ${e.message}`);
        }

        return indexData;
    }

    /**
     * 🧬 Extrai a anatomia do módulo via regex (funciona para TS e PY).
     */
    private async _extractMetadata(filePath: string): Promise<FileMetadata> {
        try {
            const content = await Bun.file(filePath).text();
            const lines = content.split("\n");

            const classes = this._extractPattern(content, /(?:export\s+)?class\s+(\w+)/g);
            const functions = this._extractPattern(content, /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g);
            const exports = this._extractPattern(content, /export\s+(?:const|let|var|class|function|interface|type|enum)\s+(\w+)/g);

            // Python-specific patterns
            if (filePath.endsWith(".py")) {
                const pyClasses = this._extractPattern(content, /^class\s+(\w+)/gm);
                const pyFunctions = this._extractPattern(content, /^(?:async\s+)?def\s+(\w+)/gm);
                classes.push(...pyClasses.filter(c => !classes.includes(c)));
                functions.push(...pyFunctions.filter(f => !functions.includes(f)));
            }

            return { classes, functions, exports, lines: lines.length };
        } catch (e: any) {
            logger.warn(`⚠️ Falha na anatomia de ${filePath}: ${e.message}`);
            return { classes: [], functions: [], exports: [], lines: 0, error: e.message };
        }
    }

    private _extractPattern(content: string, regex: RegExp): string[] {
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (match[1] && !match[1].startsWith("_")) {
                matches.push(match[1]);
            }
        }
        return matches;
    }

    private _shouldSkip(file: string): boolean {
        const skip = ["__pycache__", "node_modules", ".agent", "legacy_restore", "legacy_archive", ".git"];
        return skip.some(s => file.includes(s));
    }
}
