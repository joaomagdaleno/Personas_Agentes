import winston from "winston";
import { TypeScriptParser } from "./strategies/TypeScriptParser.ts";
import { PythonParser } from "./strategies/PythonParser.ts";
import { PolyglotParser } from "./strategies/PolyglotParser.ts";

import { ComponentMappingStrategy } from "./strategies/ComponentMappingStrategy.ts";

import { HubManagerGRPC } from "../../../core/hub_manager_grpc";

const logger = winston.child({ module: "SourceCodeParser" });

export class SourceCodeParser {
    private tsParser: TypeScriptParser;
    private pyParser: PythonParser;
    private polyParser: PolyglotParser;

    constructor(private hubManager?: HubManagerGRPC) {
        this.tsParser = new TypeScriptParser(hubManager);
        this.pyParser = new PythonParser(hubManager);
        this.polyParser = new PolyglotParser(hubManager);
    }

    async analyzePy(content: string, filename: string) {
        try { return await this.pyParser.analyze(content, filename); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [] }; }
    }

    async analyzePyMetadata(content: string, filename: string) {
        try {
            const d = await this.analyzePy(content, filename);
            return {
                complexity: await this.pyParser.calculateComplexity(filename),
                dependencies: this.pyParser.extractImports(content),
                functions: d.functions,
                classes: d.classes
            };
        } catch (e) {
            return { complexity: 1, dependencies: [], functions: [], classes: [] };
        }
    }

    async analyzeTs(content: string, filename: string) {
        try { return await this.tsParser.analyze(content, filename); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [], tree: false }; }
    }

    async calculatePyComplexity(filename: string): Promise<number> { return await this.pyParser.calculateComplexity(filename); }
    extractPyImports(content: string): string[] { return this.pyParser.extractImports(content); }
    async calculateTsComplexity(filename: string): Promise<number> { return await this.tsParser.calculateComplexity(filename); }
    extractTsImports(content: string): string[] { return this.tsParser.extractImports(content); }
    async analyzeKt(content: string) { return this.polyParser.analyzeKt(content); }
    async calculateKtComplexity(filename: string): Promise<number> { return await this.polyParser.calculateKtComplexity(filename); }

    async analyze_file_logic(content: string, fileName: string) {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext === "py") return await this.analyzePy(content, fileName);
        if (ext === "ts" || ext === "js" || ext === "tsx") return await this.analyzeTs(content, fileName);
        if (ext === "kt") return { ...await this.analyzeKt(content), complexity: await this.calculateKtComplexity(fileName) };
        if (ext === "go") return { ...this.polyParser.analyzeGo(content), complexity: await this.polyParser.calculateGoComplexity(fileName) };
        if (ext === "dart") return this.polyParser.analyzeDart(content);
        return null;
    }

    mapComponentType(relPath: string): string {
        return ComponentMappingStrategy.mapType(relPath);
    }
}
