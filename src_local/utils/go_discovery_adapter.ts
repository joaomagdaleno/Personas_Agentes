import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import winston from "winston";

const logger = winston.child({ module: "GoDiscoveryAdapter" });

export interface AtomicUnit {
    type: "class" | "function";
    name: string;
    line: number;
}

export interface FileAnalysis {
    path: string;
    exists: boolean;
    units: AtomicUnit[];
}

/**
 * 🌉 Adaptador de Descoberta Go (Nível Atômico).
 * Faz a ponte entre o Bun e o motor Go de alta performance.
 */
export class GoDiscoveryAdapter {
    private static readonly BINARY_PATH = join(process.cwd(), "src_native", "go-scanner.exe");

    /**
     * Executa o scan atômico em um diretório.
     */
    static scan(directory: string, root: string, isLegacy: boolean = false): { results: FileAnalysis[], findings: any[] } {
        if (!existsSync(this.BINARY_PATH)) {
            const msg = `⚠️ Binário Go não encontrado em ${this.BINARY_PATH}. Abortando scan Go.`;
            logger.warn(msg);
            return {
                results: [],
                findings: [{
                    type: "CRITICAL",
                    severity: "CRITICAL",
                    file: "go-scanner.exe",
                    issue: msg,
                    category: "Infrastructure",
                    context: "GoDiscoveryAdapter"
                }]
            };
        }

        try {
            const legacyFlag = isLegacy ? "-legacy=true" : "-legacy=false";
            const command = `"${this.BINARY_PATH}" -dir "${directory}" -root "${root}" ${legacyFlag}`;

            logger.info(`🔍 [GoAdapter] Iniciando scan atômico: ${directory}`);
            const startTime = Date.now();

            const output = execSync(command, { encoding: "utf8", maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
            const results: FileAnalysis[] = JSON.parse(output);

            const duration = Date.now() - startTime;
            logger.info(`✨ [GoAdapter] Scan concluído em ${duration}ms. (${results.length} arquivos analisados)`);

            return { results, findings: [] };
        } catch (error: any) {
            const msg = `🚨 Falha no scan Go: ${error.message}`;
            logger.error(msg);
            return {
                results: [],
                findings: [{
                    type: "CRITICAL",
                    severity: "CRITICAL",
                    file: "go-scanner.exe",
                    issue: msg,
                    category: "Infrastructure",
                    context: "GoDiscoveryAdapter"
                }]
            };
        }
    }
}
