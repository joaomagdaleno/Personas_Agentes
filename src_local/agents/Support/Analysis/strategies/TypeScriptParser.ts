import { HubManagerGRPC } from "../../../../core/hub_manager_grpc";
import { ParserHelpers } from "./ParserHelpers.ts";

export interface TypeScriptAnalysis {
    functions: string[];
    classes: string[];
    dependencies: string[];
    complexity: number;
    telemetry: boolean;
    tree: boolean;
}

/**
 * 🟦 TypeScriptParser - PhD in Structural Analysis (gRPC Proxy).
 */
export class TypeScriptParser {
    constructor(private hubManager?: HubManagerGRPC) { }

    async analyze(content: string, filename: string): Promise<TypeScriptAnalysis> {
        const parts = ParserHelpers.getParts(content);
        return {
            functions: [...new Set([...parts.functions, ...parts.arrows, ...parts.methods, ...parts.con])],
            classes: [...new Set(parts.classes)],
            dependencies: this.extractImports(content),
            complexity: await this.calculateComplexity(filename),
            telemetry: ParserHelpers.checkTelemetry(content),
            tree: true
        };
    }

    async calculateComplexity(filename: string): Promise<number> {
        if (!this.hubManager) return 1;

        try {
            const result = await this.hubManager.analyzeFile(filename);
            return result?.total_complexity || 1;
        } catch (err) {
            console.error(`[TypeScriptParser] gRPC complexity calculation failed:`, err);
            return 1;
        }
    }

    extractImports(content: string): string[] {
        const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
        return [...matches].map(m => m[1] || '').filter(Boolean);
    }
}
