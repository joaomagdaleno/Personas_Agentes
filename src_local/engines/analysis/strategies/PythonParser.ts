import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

export interface PythonAnalysis {
    functions: string[];
    classes: string[];
    tree: boolean | null;
}

/**
 * 🐍 PythonParser - PhD in Structural Analysis (gRPC Proxy).
 */
export class PythonParser {
    constructor(private hubManager?: HubManagerGRPC) { }

    async analyze(content: string, filename: string): Promise<PythonAnalysis> {
        const functions = [...content.matchAll(/def\s+(\w+)\s*\(/g)].map(m => m[1] || '');
        const classes = [...content.matchAll(/class\s+(\w+)\s*[:\(]/g)].map(m => m[1] || '');
        return { functions, classes, tree: true };
    }

    async calculateComplexity(filename: string): Promise<number> {
        if (!this.hubManager) return 1;

        try {
            const result = await this.hubManager.analyzeFile(filename);
            return result?.total_complexity || 1;
        } catch (err) {
            console.error(`[PythonParser] gRPC complexity calculation failed:`, err);
            return 1;
        }
    }

    extractImports(content: string): string[] {
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
