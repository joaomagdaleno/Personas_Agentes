import winston from "winston";
import { TypeScriptParser } from "./strategies/TypeScriptParser.ts";
import { PythonParser } from "./strategies/PythonParser.ts";
import { PolyglotParser } from "./strategies/PolyglotParser.ts";

const logger = winston.child({ module: "SourceCodeParser" });

export class SourceCodeParser {
    analyzePy(content: string) {
        try { return PythonParser.analyze(content); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [] }; }
    }

    analyzeTs(content: string) {
        try { return TypeScriptParser.analyze(content); }
        catch (e) { return { functions: [], classes: [], complexity: 1, dependencies: [] }; }
    }

    analyze_file_logic(content: string, fileName: string) {
        const ext = fileName.split(".").pop()?.toLowerCase();
        if (ext === "py") return this.analyzePy(content);
        if (ext === "ts" || ext === "js" || ext === "tsx") return this.analyzeTs(content);
        if (["kt", "go", "dart"].includes(ext || "")) return PolyglotParser.analyze(content, ext!);
        return null;
    }

    mapComponentType(relPath: string): string {
        const p = relPath.toLowerCase().replace(/\\/g, "/");
        if (p.includes("/agents/typescript/strategic/")) return "AGENT";
        if (p.includes("/agents/typescript/specialized/")) return "AGENT";
        if (p.includes("/core/")) return "CORE";
        if (p.includes("/utils/")) return "UTIL";
        if (p.includes("/diagnostics/") || p.includes("/analysis/")) return "LOGIC";
        if (p.includes("/test/") || p.includes(".test.") || p.includes("_test.")) return "TEST";
        if (p.endsWith(".md") || p.endsWith(".txt")) return "DOC";
        return "UNKNOWN";
    }
}
