import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";
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
        if (!this.hubManager) {
             return { functions: [], classes: [], dependencies: [], complexity: 1, telemetry: false, tree: false };
        }

        const result = await this.hubManager.analyzeFile(filename, content);
        if (!result) return { functions: [], classes: [], dependencies: [], complexity: 1, telemetry: false, tree: false };

        return {
            functions: result.functions.map((f: any) => f.name),
            classes: result.symbols.filter((s: any) => s.kind === "class").map((s: any) => s.name),
            dependencies: result.dependencies?.imports || [],
            complexity: result.cognitive_complexity || 1,
            telemetry: ["telemetry", "winston", "logger"].some(kw => content.includes(kw)),
            tree: true
        };
    }

    async calculateComplexity(filename: string): Promise<number> {
        if (!this.hubManager) return 1;
        const result = await this.hubManager.analyzeFile(filename);
        return result?.cognitive_complexity || 1;
    }

    extractImports(content: string): string[] {
        // Fallback or deprecated, ideally use analyze() result
        return [];
    }
}
