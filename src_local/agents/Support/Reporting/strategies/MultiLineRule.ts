export class MultiLineRule {
    static check(lines: string[], i: number, stripped: string, file: string, errs: any[]) {
        const isConsec = i > 0 && stripped === "" && (lines[i - 1]?.trim() === "") && (i < 2 || lines[i - 2]?.trim() !== "");
        if (isConsec) errs.push({ file, line: i + 1, issue: "MD012", severity: "low" });
        const isBlock = i > 0 && i < lines.length - 1 && stripped === "" && (lines[i - 1]?.trim() || "").startsWith(">") && (lines[i + 1]?.trim() || "").startsWith(">");
        if (isBlock) errs.push({ file, line: i + 1, issue: "MD028", severity: "medium" });
    }
}
