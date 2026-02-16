/**
 * SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
 * Módulo: Detector de Erros Silenciados (SilentErrorDetector)
 * Função: Especialista em identificar capturas de exceção sem tratamento.
 * Soberania: SECURITY-AGENT.
 */
import winston from "winston";

const logger = winston.child({ module: "SilentErrorDetector" });

export interface SilentErrorIssue {
    file: string;
    line: number;
    issue: string;
    severity: string;
    context: string;
    snippet: string;
}

/**
 * 🔇 SilentErrorDetector — Detecta padrões de falha lógica silenciosa.
 *
 * Identifica blocos try/catch vazios, catch genéricos sem tratamento,
 * e padrões de supressão de erro que podem esconder bugs críticos.
 */
export class SilentErrorDetector {
    private readonly SILENT_PATTERNS = [
        /catch\s*\([^)]*\)\s*\{\s*\}/,                          // catch vazio: catch(e) {}
        /catch\s*\([^)]*\)\s*\{\s*\/\/.*\s*\}/,                 // catch com apenas comentário
        /catch\s*\([^)]*\)\s*\{\s*(continue|break)\s*;?\s*\}/,  // catch com continue/break
        /\.catch\s*\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/,              // .catch(() => {})
        /\.catch\s*\(\s*\(\)\s*=>\s*null\s*\)/,                 // .catch(() => null)
        /\.catch\s*\(\s*\(\)\s*=>\s*undefined\s*\)/,            // .catch(() => undefined)
        /except\s*:\s*\n\s*(pass|continue)/,                    // Python: except: pass
    ];

    private readonly SAFE_PATTERNS = [
        /logger\.(error|warn|warning|info|debug)/,
        /console\.(error|warn|log)/,
        /throw\s+/,
        /reject\s*\(/,
        /process\.exit/,
    ];

    /**
     * 🔍 Detecta erros silenciados no conteúdo de um arquivo.
     */
    detect(content: string, filePath: string): SilentErrorIssue[] {
        const issues: SilentErrorIssue[] = [];
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const surroundingBlock = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5)).join("\n");

            for (const pattern of this.SILENT_PATTERNS) {
                if (pattern.test(surroundingBlock) && !this._isSafeContext(surroundingBlock)) {
                    // Evita duplicatas: verifica se já reportamos para esta região
                    const alreadyReported = issues.some(iss => Math.abs(iss.line - (i + 1)) < 3);
                    if (alreadyReported) continue;

                    const issue = this._createIssue(i + 1, filePath, lines);
                    issues.push(issue);
                    logger.debug(`🔇 Silent error detected: ${filePath}:${i + 1}`);
                    break;
                }
            }
        }

        return issues;
    }

    /**
     * Verifica se o catch é "seguro" (logging, rethrow, etc).
     */
    private _isSafeContext(block: string): boolean {
        return this.SAFE_PATTERNS.some(p => p.test(block));
    }

    /**
     * Cria o finding estruturado.
     */
    private _createIssue(line: number, filePath: string, lines: string[]): SilentErrorIssue {
        const start = Math.max(0, line - 3);
        const end = Math.min(lines.length, line + 3);
        return {
            file: filePath,
            line,
            issue: "Captura de erro silenciosa detectada (try/catch sem tratamento).",
            severity: "HIGH",
            context: "SilentErrorDetector",
            snippet: lines.slice(start, end).join("\n"),
        };
    }
}
