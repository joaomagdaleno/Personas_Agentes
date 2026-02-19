export class TableRules {
    static isTable(l: string) { return l.trim().startsWith("|") && l.trim().endsWith("|"); }
    static ensureBlanks(lines: string[]): string[] {
        const res: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const prefix = lines[i].match(/^>\s*/)?.[0] || "";
            if (this.isTable(lines[i])) {
                if (res.length > 0 && res[res.length - 1].replace(/^>\s*/, "").trim() !== "" && !this.isTable(res[res.length - 1])) res.push(prefix.trimEnd());
                res.push(lines[i]);
                if (i + 1 < lines.length && !this.isTable(lines[i + 1]) && lines[i + 1].replace(/^>\s*/, "").trim() !== "") res.push(prefix.trimEnd());
            } else res.push(lines[i]);
        }
        return res;
    }
}
