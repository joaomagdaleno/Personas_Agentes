export class SpacingStrategy {
    static check(lines: string[], i: number, stripped: string, file: string, errs: any[]) {
        if (i > 0 && stripped === "" && (lines[i - 1]?.trim() === "") && (i < 2 || lines[i - 2]?.trim() !== "")) errs.push({ file, line: i + 1, issue: "MD012: Multiple consecutive blank lines", severity: "low", context: "MarkdownAuditor" });
        if (i > 0 && i < lines.length - 1 && stripped === "" && (lines[i - 1]?.trim() || "").startsWith(">") && (lines[i + 1]?.trim() || "").startsWith(">")) errs.push({ file, line: i + 1, issue: "MD028: Blank line inside blockquote", severity: "medium", context: "MarkdownAuditor" });
    }
}
