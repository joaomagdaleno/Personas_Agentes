export class QuoteRules {
    static ensureContinuity(lines: string[]): string[] {
        return lines.map((line, i) => {
            if (i > 0 && i < lines.length - 1 && line.trim() === "" && lines[i - 1].trim().startsWith(">") && lines[i + 1].trim().startsWith(">")) {
                return (lines[i - 1].match(/^>\s*/)?.[0] || ">").trimEnd();
            }
            return line;
        });
    }
}
