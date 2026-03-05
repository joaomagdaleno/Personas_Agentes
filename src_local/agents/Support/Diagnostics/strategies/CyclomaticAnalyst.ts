import * as ts from "typescript";

/**
 * 🌀 CyclomaticAnalyst — Specialized in Cyclomatic Complexity.
 */
export class CyclomaticAnalyst {
    private static readonly BRANCH_KINDS = new Set([
        ts.SyntaxKind.IfStatement,
        ts.SyntaxKind.WhileStatement,
        ts.SyntaxKind.DoStatement,
        ts.SyntaxKind.ForStatement,
        ts.SyntaxKind.ForInStatement,
        ts.SyntaxKind.ForOfStatement,
        ts.SyntaxKind.ConditionalExpression,
        ts.SyntaxKind.CaseClause,
        ts.SyntaxKind.CatchClause
    ]);

    private static readonly LOGICAL_TOKENS = new Set([
        ts.SyntaxKind.AmpersandAmpersandToken,
        ts.SyntaxKind.BarBarToken,
        ts.SyntaxKind.QuestionQuestionToken
    ]);

    static calculate(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let count = 1;

        const visitor = (node: ts.Node) => {
            if (this.BRANCH_KINDS.has(node.kind)) {
                count++;
            } else if (ts.isBinaryExpression(node) && this.LOGICAL_TOKENS.has(node.operatorToken.kind)) {
                count++;
            }
            ts.forEachChild(node, visitor);
        };

        ts.forEachChild(sourceFile, visitor);
        return count;
    }
}
