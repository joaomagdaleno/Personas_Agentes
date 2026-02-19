import * as path from 'node:path';
export class PatternFinder {
    static find(context: Record<string, any>, extensions: string[], rules: any[], ignored: string[], agent: any): any[] {
        return Object.entries(context)
            .filter(([f, data]) => extensions.some(e => f.endsWith(e)) && !ignored.includes(path.basename(f)) && data.component_type !== "TEST")
            .reduce((acc: any[], [file, data]) => {
                const content = data.content || "";
                if (!content) return acc;
                rules.forEach(rule => {
                    if (rule.regex.test(content)) acc.push({ file, agent: agent.name, role: agent.role, emoji: agent.emoji, issue: rule.issue, severity: rule.severity, stack: agent.stack });
                });
                return acc;
            }, []);
    }
}
