import * as path from 'node:path';
export class PatternFinder {
    static find(context: Record<string, any>, extensions: string[], rules: any[], ignored: string[], agent: any): any[] {
        const entries = Object.entries(context);
        const analyzable = entries.filter(([f, data]) => this.isAnalyzable(f, data, extensions, ignored));

        return analyzable.reduce((acc, [file, data]) => {
            const matches = this.scanFile(file, data.content || "", rules, agent);
            return acc.concat(matches);
        }, [] as any[]);
    }

    private static isAnalyzable(f: string, data: any, extensions: string[], ignored: string[]): boolean {
        const hasExt = extensions.some(e => f.endsWith(e));
        const isIgnored = ignored.includes(path.basename(f));
        const isTest = data.component_type === "TEST";
        return hasExt && !isIgnored && !isTest;
    }

    private static scanFile(file: string, content: string, rules: any[], agent: any): any[] {
        if (!content) return [];
        const results: any[] = [];

        rules.forEach(rule => {
            const regex = rule.regex instanceof RegExp ? rule.regex : new RegExp(rule.regex, 'g');
            const matches = content.matchAll(regex);
            for (const match of matches) {
                results.push({
                    file,
                    agent: agent.name,
                    role: agent.role,
                    emoji: agent.emoji,
                    issue: rule.issue,
                    severity: rule.severity,
                    stack: agent.stack,
                    evidence: match[0].substring(0, 100)
                });
            }
        });
        return results;
    }
}
