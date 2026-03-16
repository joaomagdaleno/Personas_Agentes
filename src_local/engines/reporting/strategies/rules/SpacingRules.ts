import type { LintRule } from "./LintRule.ts";

export class SpacingRules implements LintRule {
    check(lines: string[], i: number, stripped: string, file: string, context: { hMap: Map<string, number>, errs: any[] }): void {
        const isBlank = stripped === "";
        const prevIsBlank = i > 0 && lines[i - 1]?.trim() === "";
        const prevPrevIsNotBlank = i < 2 || lines[i - 2]?.trim() !== "";

        if (i > 0 && isBlank && prevIsBlank && prevPrevIsNotBlank) {
            context.errs.push({
                file, line: i + 1, issue: "MD012: Multiple consecutive blank lines", severity: "low", context: "MarkdownAuditor"
            });
        }

        const nextLine = lines[i + 1]?.trim() || "";
        const prevLine = lines[i - 1]?.trim() || "";
        if (i > 0 && i < lines.length - 1 && isBlank && prevLine.startsWith(">") && nextLine.startsWith(">")) {
            context.errs.push({
                file, line: i + 1, issue: "MD028: Blank line inside blockquote", severity: "medium", context: "MarkdownAuditor"
            });
        }
    }
}
