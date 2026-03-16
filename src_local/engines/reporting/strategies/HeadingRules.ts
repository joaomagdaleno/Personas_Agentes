export class HeadingRules {
    static ensureBlanks(lines: string[]): string[] {
        return lines.reduce((acc: string[], line, i) => {
            const isHeading = line.replace(/^>\s*/, "").trim().startsWith("#");
            const prefix = line.match(/^>\s*/)?.[0] || "";
            if (isHeading && acc.length > 0 && acc[acc.length - 1].replace(/^>\s*/, "").trim() !== "") acc.push(prefix.trimEnd());
            acc.push(line);
            if (isHeading && i + 1 < lines.length && lines[i + 1].replace(/^>\s*/, "").trim() !== "") acc.push(prefix.trimEnd());
            return acc;
        }, []);
    }
}
