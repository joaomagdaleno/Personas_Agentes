import * as ts from "typescript";
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
 * 🟦 TypeScriptParser - PhD in Structural Analysis
 */
export class TypeScriptParser {
    static analyze(content: string): TypeScriptAnalysis {
        const parts = ParserHelpers.getParts(content);
        return {
            functions: [...new Set([...parts.functions, ...parts.arrows, ...parts.methods, ...parts.con])],
            classes: [...new Set(parts.classes)],
            dependencies: this.extractImports(content),
            complexity: this.calculateComplexity(content),
            telemetry: ParserHelpers.checkTelemetry(content),
            tree: true
        };
    }

    static calculateComplexity(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let count = 1;
        const visitor = (node: ts.Node) => {
            count += this._nodeComplexity(node);
            ts.forEachChild(node, visitor);
        };
        ts.forEachChild(sourceFile, visitor);
        return count;
    }

    private static _nodeComplexity(node: ts.Node): number {
        if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isForStatement(node) ||
            ts.isCaseClause(node) || ts.isCatchClause(node) || ts.isConditionalExpression(node)) return 1;
        if (ts.isBinaryExpression(node)) {
            const op = node.operatorToken.kind;
            if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.BarBarToken) return 1;
        }
        return 0;
    }

    static extractImports(content: string): string[] {
        const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+ as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
        return [...matches].map(m => m[1] || '').filter(Boolean);
    }
}
