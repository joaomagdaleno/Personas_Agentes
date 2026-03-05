export class TableRules {
    static isTable(l: string) { return l.trim().startsWith("|") && l.trim().endsWith("|"); }
    static ensureBlanks(lines: string[]): string[] {
        const res: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const prefix = line.match(/^>\s*/)?.[0] || "";

            if (!this.isTable(line)) {
                res.push(line);
                continue;
            }

            this.addLeadingBlank(res, prefix);
            res.push(line);
            this.addTrailingBlank(lines, i, res, prefix);
        }
        return res;
    }

    private static addLeadingBlank(res: string[], prefix: string) {
        if (res.length === 0) return;

        const last = res[res.length - 1].replace(/^>\s*/, "").trim();
        if (last !== "" && !this.isTable(res[res.length - 1])) {
            res.push(prefix.trimEnd());
        }
    }

    private static addTrailingBlank(lines: string[], i: number, res: string[], prefix: string) {
        if (i + 1 >= lines.length) return;

        const next = lines[i + 1];
        if (!this.isTable(next) && next.replace(/^>\s*/, "").trim() !== "") {
            res.push(prefix.trimEnd());
        }
    }
}
