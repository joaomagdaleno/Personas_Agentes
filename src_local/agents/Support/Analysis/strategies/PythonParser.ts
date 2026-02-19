export interface PythonAnalysis {
    functions: string[];
    classes: string[];
    tree: boolean | null;
}

export class PythonParser {
    static analyze(content: string): PythonAnalysis {
        const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1] || '');
        const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1] || '');
        return { functions, classes, tree: true };
    }

    static calculateComplexity(content: string): number {
        const matches = [...content.matchAll(/\b(if|while|for|except|with)\b|\band\b|\bor\b/g)];
        return 1 + matches.length;
    }

    static extractImports(content: string): string[] {
        const imports: string[] = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const t = line.trim();
            if (!t || t.startsWith('#')) continue;
            if (t.startsWith('import ')) {
                t.substring(7).split(',').forEach(s => {
                    const mod = s.trim().split('.')[0];
                    if (mod) imports.push(mod);
                });
            }
            if (t.startsWith('from ')) {
                const match = t.match(/^from\s+([\w.]+)\s+import/);
                const mod = match?.[1]?.split('.')[0];
                if (mod) imports.push(mod);
            }
        }
        return [...new Set(imports)];
    }
}
