import * as ts from "typescript";

/**
 * 🧠 CognitiveAnalyst — Specialized in Cognitive Complexity (AST based).
 */
export class CognitiveAnalyst {
    static calculate(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let totalWeight = 0;

        const nestableKinds = [
            ts.SyntaxKind.IfStatement,
            ts.SyntaxKind.WhileStatement,
            ts.SyntaxKind.DoStatement,
            ts.SyntaxKind.ForStatement,
            ts.SyntaxKind.ForInStatement,
            ts.SyntaxKind.ForOfStatement,
            ts.SyntaxKind.CatchClause,
            ts.SyntaxKind.SwitchStatement,
            ts.SyntaxKind.ArrowFunction,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.MethodDeclaration
        ];

        const analyze = (node: ts.Node, nestingLevel: number) => {
            let weight = 0;
            let nextNestingLevel = nestingLevel;

            if (nestableKinds.includes(node.kind)) {
                if (node.kind !== ts.SyntaxKind.ArrowFunction &&
                    node.kind !== ts.SyntaxKind.FunctionDeclaration &&
                    node.kind !== ts.SyntaxKind.MethodDeclaration) {
                    weight = 1 + nestingLevel;
                }
                nextNestingLevel++;
            } else if (node.kind === ts.SyntaxKind.ConditionalExpression) {
                weight = 1 + nestingLevel;
            }

            totalWeight += weight;
            ts.forEachChild(node, (child) => analyze(child, nextNestingLevel));
        };

        ts.forEachChild(sourceFile, (node) => analyze(node, 0));
        return totalWeight;
    }
}
