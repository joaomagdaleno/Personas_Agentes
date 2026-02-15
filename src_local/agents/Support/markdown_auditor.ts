/**
 * 🕵️ Markdown Auditor PhD.
 * Especializado em detectar quebras de normas MD041, MD047 e outras diretrizes PhD.
 */
export interface MarkdownFinding {
    file: string;
    line: number;
    issue: string;
    severity: "MEDIUM" | "HIGH" | "CRITICAL";
    code?: string;
}

export class MarkdownAuditor {
    /**
     * Executa auditoria em conteúdo Markdown.
     */
    static auditMarkdown(filePath: string, content: string): MarkdownFinding[] {
        const lines = content.split("\n");
        const findings: MarkdownFinding[] = [];
        const headings: Record<string, number> = {};
        let inCb = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === undefined) continue;
            const stripped = line.trim();

            if (stripped.startsWith("```")) {
                inCb = !inCb;
                continue;
            }

            if (inCb) continue;

            // MD041: O documento deve começar com um H1
            if (i === 0 && !stripped.startsWith("# ")) {
                findings.push({
                    file: filePath,
                    line: i + 1,
                    issue: "MD041: Top-level heading (H1) missing at start of file",
                    severity: "MEDIUM"
                });
            }

            // MD012: Linhas em branco consecutivas (Rigor PhD: Máximo 1)
            if (i > 1 && stripped === "") {
                const prev1 = lines[i - 1];
                const prev2 = lines[i - 2];
                if (prev1 !== undefined && prev1.trim() === "" && prev2 !== undefined && prev2.trim() === "") {
                    findings.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD012: Multiple consecutive blank lines",
                        severity: "MEDIUM"
                    });
                }
            }

            if (stripped.startsWith("#")) {
                // MD022: Espaçamento em volta de headers
                if (i > 0) {
                    const prevLine = lines[i - 1];
                    if (prevLine !== undefined && prevLine.trim() !== "") {
                        findings.push({
                            file: filePath,
                            line: i + 1,
                            issue: "MD022: Headings should be surrounded by blank lines (above)",
                            severity: "MEDIUM"
                        });
                    }
                }

                if (i < lines.length - 1) {
                    const nextLine = lines[i + 1];
                    if (nextLine !== undefined && nextLine.trim() !== "") {
                        findings.push({
                            file: filePath,
                            line: i + 1,
                            issue: "MD022: Headings should be surrounded by blank lines (below)",
                            severity: "MEDIUM"
                        });
                    }
                }

                // MD024: Headers duplicados
                const headingText = stripped.replace(/[.!?:,;! \t\n\r]+$/, "");
                if (headings[headingText] !== undefined) {
                    findings.push({
                        file: filePath,
                        line: i + 1,
                        issue: `MD024: Duplicate heading content: ${headingText}`,
                        severity: "MEDIUM"
                    });
                }
                headings[headingText] = i;

                // MD026: Pontuação no final do header
                if (/[.!?:,;!]$/.test(stripped)) {
                    findings.push({
                        file: filePath,
                        line: i + 1,
                        issue: "MD026: Trailing punctuation in heading",
                        severity: "MEDIUM"
                    });
                }
            }
        }

        // MD047: Newline no final do arquivo
        if (content.length > 0 && !content.endsWith("\n")) {
            findings.push({
                file: filePath,
                line: lines.length,
                issue: "MD047: File should end with a single newline character",
                severity: "MEDIUM"
            });
        }

        return findings;
    }
}
