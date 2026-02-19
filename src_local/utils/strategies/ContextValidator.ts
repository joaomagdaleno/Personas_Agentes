import * as ts from "typescript";

export class ContextValidator {
    static isNodeSafe(node: ts.Node, sourceFile: ts.SourceFile, obsFn: (n: ts.Node) => boolean, metaFn: (n: ts.Node) => boolean, mathFn: (n: ts.Node) => boolean): boolean {
        const f = sourceFile.fileName.replace(/\\/g, "/"), checks = [
            () => ["/tests/", "tests/", "/scripts/", "scripts/", "src_local/agents/", "src_local/core/", "src_local/utils/"].some(p => f.includes(p)),
            () => [".test.", ".spec.", ".md", ".txt"].some(e => f.includes(e)),
            () => ["run-diagnostic.ts", "run-diagnostic.py", "extract_personas.ts", "reorganize_support.ts", "update_imports.ts"].some(rf => f.endsWith(rf)),
            () => obsFn(node) || metaFn(node) || mathFn(node)
        ];
        return checks.some(c => c());
    }
}
