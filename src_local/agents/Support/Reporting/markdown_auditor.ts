import winston from "winston";
import * as fs from "node:fs";

const logger = winston.child({ module: "MarkdownAuditor" });
import { LintRules } from "./strategies/LintRules.ts";
export interface LintError { rule: string; line: number; message: string; }

/**
 * ✍️ MarkdownAuditor — PhD in Document Integrity
 */
export class MarkdownAuditor {
    public auditFile(filePath: string): LintError[] {
        if (!fs.existsSync(filePath)) return [{ rule: "FILE_NOT_FOUND", line: 0, message: "Target file missing" }];
        return MarkdownAuditor.auditMarkdown(filePath, fs.readFileSync(filePath, "utf-8"));
    }

    public static auditMarkdown(filePath: string, content: string): any[] {
        const lines = content.split("\n"), errors: any[] = [], headings = new Map<string, number>();
        let inCodeBlock = false;
        lines.forEach((line, i) => {
            if (line === undefined) return;
            const stripped = line.trim();
            if (stripped.startsWith("```")) { inCodeBlock = !inCodeBlock; return; }
            if (inCodeBlock) return;
            LintRules.run(lines, i, stripped, filePath, headings, errors);
        });
        return errors;
    }


    public formatErrors(errors: LintError[]): string {
        if (errors.length === 0) return "✅ Relatório em conformidade PhD.";
        let md = `### 🚨 Violações de Conformidade MD (${errors.length})\n\n| Regra | Linha | Mensagem |\n| :--- | :---: | :--- |\n`;
        errors.forEach(err => md += `| \`${err.rule}\` | ${err.line} | ${err.message} |\n`);
        return md;
    }
}
