import type { LintRule } from "./LintRule.ts";

export class HeadingRules implements LintRule {
    check(lines: string[], i: number, stripped: string, file: string, context: { hMap: Map<string, number>, errs: any[] }): void {
        if (!stripped.startsWith("#")) return;

        if (!/^#+\s/.test(stripped)) {
            context.errs.push({ file, line: i + 1, issue: "MD001: Heading levels should be followed by a space", severity: "medium", context: "MarkdownAuditor" });
        }

        if (i > 0 && (lines[i - 1]?.trim() || "") !== "") {
            context.errs.push({ file, line: i + 1, issue: "MD022: Headings should be surrounded by blank lines (above)", severity: "low", context: "MarkdownAuditor" });
        }

        const nextLine = lines[i + 1]?.trim() || "";
        if (i < lines.length - 1 && nextLine !== "" && !nextLine.startsWith("#")) {
            context.errs.push({ file, line: i + 1, issue: "MD022: Headings should be surrounded by blank lines (below)", severity: "low", context: "MarkdownAuditor" });
        }

        const text = stripped.replace(/^#+\s+/, "");
        if (context.hMap.has(text)) {
            context.errs.push({ file, line: i + 1, issue: `MD024: Duplicate headingFound: '${text}'`, severity: "medium", context: "MarkdownAuditor" });
        }
        context.hMap.set(text, i);

        if (/[.,;:!?]$/.test(text)) {
            context.errs.push({ file, line: i + 1, issue: "MD026: Trailing punctuation in heading", severity: "low", context: "MarkdownAuditor" });
        }
    }
}
