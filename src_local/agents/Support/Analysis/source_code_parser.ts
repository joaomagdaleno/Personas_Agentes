import winston from "winston";
import { TypeScriptParser } from "./strategies/TypeScriptParser.ts";
import { PythonParser } from "./strategies/PythonParser.ts";
import { PolyglotParser } from "./strategies/PolyglotParser.ts";

import { ComponentMappingStrategy } from "./strategies/ComponentMappingStrategy.ts";

const logger = winston.child({ module: "SourceCodeParser" });

export class SourceCodeParser {
    analyzePy(content: string) {
        try { return PythonParser.analyze(content); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [] }; }
    }

    analyzePyMetadata(content: string) {
        try {
            const d = this.analyzePy(content);
            return {
                complexity: PythonParser.calculateComplexity(content),
                dependencies: PythonParser.extractImports(content),
                functions: d.functions,
                classes: d.classes
            };
        } catch (e) {
            return { complexity: 1, dependencies: [], functions: [], classes: [] };
        }
    }

    analyzeTs(content: string) {
        try { return TypeScriptParser.analyze(content); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [] }; }
    }

    analyze_file_logic(content: string, fileName: string) {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext === "py") return this.analyzePy(content);
        if (ext === "ts" || ext === "js" || ext === "tsx") return this.analyzeTs(content);
        if (ext === "kt") return { ...PolyglotParser.analyzeKt(content), complexity: PolyglotParser.calculateKtComplexity(content) };
        if (ext === "go") return PolyglotParser.analyzeGo(content);
        if (ext === "dart") return PolyglotParser.analyzeDart(content);
        return null;
    }

    mapComponentType(relPath: string): string {
        return ComponentMappingStrategy.mapType(relPath);
    }
}
