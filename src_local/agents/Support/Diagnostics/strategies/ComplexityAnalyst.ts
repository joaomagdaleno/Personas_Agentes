import * as ts from "typescript";

/**
 * 🧠 ComplexityAnalyst — Specialized in code entropy and decision mapping.
 */
export class ComplexityAnalyst {
    /**
     * 1. Complexidade Ciclomática (Cyclomatic Complexity)
     * CC = 1 + número de decisões (if, while, for, case, catch, &&, ||, ternary)
     */
    static calculateCyclomaticComplexity(content: string): number {
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

    /**
     * 2. Complexidade Cognitiva (AST based)
     */
    static calculateCognitiveComplexity(content: string): number {
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

    /**
     * 3. Complexidade de Halstead
     */
    static calculateHalsteadMetrics(content: string): { volume: number; difficulty: number; effort: number } {
        const operators = content.match(/[+\-*/%=<>!&|^~?:]+|&&|\|\||\.\.\.|\?\./g) || [];
        const uniqueOperators = new Set(operators);

        const operands = content.match(/\b[a-zA-Z_]\w*\b/g) || [];
        const uniqueOperands = new Set(operands);

        const n1 = uniqueOperators.size;
        const n2 = uniqueOperands.size;
        const N1 = operators.length;
        const N2 = operands.length;

        const totalUnique = n1 + n2;
        const volume = totalUnique > 0 ? totalUnique * Math.log2(totalUnique) : 0;
        const difficulty = n1 > 0 ? (n1 / 2) * (N2 / Math.max(1, n2)) : 0;
        const effort = volume * difficulty;

        return { volume, difficulty, effort };
    }
}
