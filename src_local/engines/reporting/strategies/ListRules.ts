export class ListRules {
    static ensureBlanks(lines: string[]): string[] {
        const isList = (l: string) => /^\s*([-*]|\d+\.)\s+/.test(l.replace(/^>\s*/, ""));
        return lines.reduce((acc: string[], line, i) => {
            const prefix = line.match(/^>\s*/)?.[0] || "";
            const prev = i > 0 ? lines[i - 1] : "";
            if (isList(line) && prev.replace(/^>\s*/, "").trim() !== "" && !isList(prev) && acc[acc.length - 1]?.trim() !== "") acc.push(prefix.trimEnd());
            acc.push(line);
            const next = lines[i + 1] || "";
            if (isList(line) && !isList(next) && next.replace(/^>\s*/, "").trim() !== "") acc.push(prefix.trimEnd());
            return acc;
        }, []);
    }
}
