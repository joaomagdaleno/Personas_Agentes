export class LintRules {
    static checkSpacing(lines: string[], i: number, stripped: string, file: string, errs: any[]) {
        if (i > 0 && stripped === "" && (lines[i - 1]?.trim() === "") && (i < 2 || lines[i - 2]?.trim() !== "")) errs.push({ file, line: i + 1, issue: "MD012: Multiple consecutive blank lines", severity: "low", context: "MarkdownAuditor" });
        if (i > 0 && i < lines.length - 1 && stripped === "" && (lines[i - 1]?.trim() || "").startsWith(">") && (lines[i + 1]?.trim() || "").startsWith(">")) errs.push({ file, line: i + 1, issue: "MD028: Blank line inside blockquote", severity: "medium", context: "MarkdownAuditor" });
    }

    static checkHeadings(lines: string[], i: number, stripped: string, file: string, hMap: Map<string, number>, errs: any[]) {
        if (!/^#+\s/.test(stripped)) errs.push({ file, line: i + 1, issue: "MD001: Heading levels should be followed by a space", severity: "medium", context: "MarkdownAuditor" });
        if (i > 0 && (lines[i - 1]?.trim() || "") !== "") errs.push({ file, line: i + 1, issue: "MD022: Headings should be surrounded by blank lines (above)", severity: "low", context: "MarkdownAuditor" });
        if (i < lines.length - 1 && (lines[i + 1]?.trim() || "") !== "" && !lines[i + 1]?.trim()?.startsWith("#")) errs.push({ file, line: i + 1, issue: "MD022: Headings should be surrounded by blank lines (below)", severity: "low", context: "MarkdownAuditor" });
        const text = stripped.replace(/^#+\s+/, "");
        if (hMap.has(text)) errs.push({ file, line: i + 1, issue: `MD024: Duplicate headingFound: '${text}'`, severity: "medium", context: "MarkdownAuditor" });
        hMap.set(text, i);
        if (/[.,;:!?]$/.test(text)) errs.push({ file, line: i + 1, issue: "MD026: Trailing punctuation in heading", severity: "low", context: "MarkdownAuditor" });
    }
}
