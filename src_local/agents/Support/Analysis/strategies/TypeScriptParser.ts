import * as ts from "typescript";

export interface TypeScriptAnalysis {
    functions: string[];
    classes: string[];
    dependencies: string[];
    complexity: number;
    telemetry: boolean;
    tree: boolean;
}

export class TypeScriptParser {
    static analyze(content: string): TypeScriptAnalysis {
        const functions = [...content.matchAll(/function\s+(\w+)/g)].map(m => m[1] || '');
        const arrows = [...content.matchAll(/const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g)].map(m => m[1] || '');
        const methods = [...content.matchAll(/(?:(public|private|protected|static|async)\s+)?(\w+)\s*\(/g)].map(m => m[2] || '');
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
        const constructors = [...content.matchAll(/constructor\s*\(/g)].map(() => 'constructor');

        const hasTelemetry = content.includes("winston") ||
            content.includes("logger.info") ||
            content.includes("logger.debug") ||
            content.includes("log_performance") ||
            /telemetry|console\.log/.test(content);

        return {
            functions: [...new Set([...functions, ...arrows, ...methods, ...constructors])],
            classes: [...new Set(classes)],
            dependencies: this.extractImports(content),
            complexity: this.calculateComplexity(content),
            telemetry: hasTelemetry,
            tree: true
        };
    }

    static calculateComplexity(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let count = 1;

        const visitor = (node: ts.Node) => {
            switch (node.kind) {
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.CaseClause:
                case ts.SyntaxKind.CatchClause:
                case ts.SyntaxKind.ConditionalExpression:
                    count++;
                    break;
                case ts.SyntaxKind.BinaryExpression:
                    const binExp = node as ts.BinaryExpression;
                    if (binExp.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                        binExp.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                        count++;
                    }
                    break;
            }
            ts.forEachChild(node, visitor);
        };

        ts.forEachChild(sourceFile, visitor);
        return count;
    }

    static extractImports(content: string): string[] {
        const imports: string[] = [];
        const matches = content.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g);
        for (const m of matches) {
            if (m[1]) imports.push(m[1]);
        }
        return imports;
    }
}
