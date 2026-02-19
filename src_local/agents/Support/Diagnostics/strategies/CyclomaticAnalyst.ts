import * as ts from "typescript";

/**
 * 🌀 CyclomaticAnalyst — Specialized in Cyclomatic Complexity.
 * CC = 1 + número de decisões (if, while, for, case, catch, &&, ||, ternary)
 */
export class CyclomaticAnalyst {
    static calculate(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let count = 1;

        const visitor = (node: ts.Node) => {
            switch (node.kind) {
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.DoStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.ForOfStatement:
                case ts.SyntaxKind.ConditionalExpression:
                case ts.SyntaxKind.CaseClause:
                case ts.SyntaxKind.CatchClause:
                    count++;
                    break;
                case ts.SyntaxKind.BinaryExpression:
                    const binExp = node as ts.BinaryExpression;
                    if (
                        binExp.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                        binExp.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
                        binExp.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
                    ) {
                        count++;
                    }
                    break;
            }
            ts.forEachChild(node, visitor);
        };

        ts.forEachChild(sourceFile, visitor);
        return count;
    }
}
