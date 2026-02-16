import winston from "winston";
import * as fs from "node:fs";

const logger = winston.child({ module: "MarkdownAuditor" });

export interface LintError {
    rule: string;
    line: number;
    message: string;
}

/**
 * ✍️ MarkdownAuditor — PhD in Document Integrity
 * Especialista em validar a conformidade de relatórios com as normas PhD.
 */
export class MarkdownAuditor {

    /**
     * Valida um arquivo Markdown buscando violações de regras MD0xx.
     */
    public auditFile(filePath: string): LintError[] {
        if (!fs.existsSync(filePath)) {
            logger.error(`❌ [Auditor] Arquivo não encontrado: ${filePath}`);
            return [{ rule: "FILE_NOT_FOUND", line: 0, message: "Target file missing" }];
        }

        const content = fs.readFileSync(filePath, "utf-8");
        return MarkdownAuditor.auditMarkdown(filePath, content);
    }

    /**
     * Versão estática que aceita o conteúdo diretamente (PhD Bun Style).
     */
    public static auditMarkdown(filePath: string, content: string): any[] {
        const lines = content.split("\n");
        const errors: any[] = [];
        const headings = new Map<string, number>();
        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === undefined) continue;
            const stripped = line.trim();

            // Toggle Code Block
            if (stripped.startsWith("```")) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) continue;

            // MD012: Multiple consecutive blank lines
            if (i > 0 && stripped === "" && (lines[i - 1]?.trim() ?? "") === "") {
                if (i < 2 || (lines[i - 2]?.trim() ?? "") !== "") { // Detect start of double blank
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD012: Multiple consecutive blank lines",
                        severity: "low",
                        context: "MarkdownAuditor"
                    });
                }
            }

            // Headings Analysis
            if (stripped.startsWith("#")) {
                // MD001: Heading integrity
                if (!/^#+\s/.test(stripped)) {
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD001: Heading levels should be followed by a space",
                        severity: "medium",
                        context: "MarkdownAuditor"
                    });
                }

                // MD022: Spacing around headings
                if (i > 0 && (lines[i - 1]?.trim() ?? "") !== "") {
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD022: Headings should be surrounded by blank lines (above)",
                        severity: "low",
                        context: "MarkdownAuditor"
                    });
                }
                if (i < lines.length - 1 && (lines[i + 1]?.trim() ?? "") !== "" && !lines[i + 1]?.trim()?.startsWith("#")) {
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD022: Headings should be surrounded by blank lines (below)",
                        severity: "low",
                        context: "MarkdownAuditor"
                    });
                }

                // MD024: Duplicate headings
                const headingText = stripped.replace(/^#+\s+/, "");
                if (headings.has(headingText)) {
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: `MD024: Duplicate heading found: '${headingText}'`,
                        severity: "medium",
                        context: "MarkdownAuditor"
                    });
                }
                headings.set(headingText, i);

                // MD026: Trailing punctuation
                if (/[.,;:!?]$/.test(headingText)) {
                    errors.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD026: Trailing punctuation in heading",
                        severity: "low",
                        context: "MarkdownAuditor"
                    });
                }
            }
        }

        return errors;
    }

    /**
     * Formata os erros encontrados para inclusão no relatório.
     */
    public formatErrors(errors: LintError[]): string {
        if (errors.length === 0) return "✅ Relatório em conformidade PhD.";

        let md = `### 🚨 Violações de Conformidade MD (${errors.length})\n\n`;
        md += "| Regra | Linha | Mensagem |\n| :--- | :---: | :--- |\n";
        for (const err of errors) {
            md += `| \`${err.rule}\` | ${err.line} | ${err.message} |\n`;
        }
        return md;
    }
}
