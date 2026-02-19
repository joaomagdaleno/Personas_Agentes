/**
 * 🕵️ ExtractorHelpers - PhD in Pattern Recognition
 */
export class ExtractorHelpers {
    static getPythonRegexes() {
        return [
            { regex: /def\s+(\w+)\s*\(/g, type: "function" },
            { regex: /class\s+(\w+)/g, type: "class" },
            { regex: /self\.prompt\s*=\s*['"]([^'"]+)['"]/g, type: "prompt" },
            { regex: /self\.rules\s*=\s*\[([^\]]+)\]/g, type: "rules" }
        ];
    }

    static getTSRegexes() {
        return [
            { regex: /function\s+(\w+)/g, type: "function" },
            { regex: /class\s+(\w+)/g, type: "class" },
            { regex: /this\.name\s*=\s*['"]([^'"]+)['"]/g, type: "name" },
            { regex: /const\s+(\w+)\s*=\s*\(.*\)\s*=>/g, type: "arrow" }
        ];
    }

    static processMatches(content: string, patterns: any[]) {
        const findings: any[] = [];
        patterns.forEach(p => {
            const matches = [...content.matchAll(p.regex)];
            matches.forEach(m => findings.push({ type: p.type, value: m[1] }));
        });
        return findings;
    }
}
