import * as ts from "typescript";
import { exists, readFile } from "node:fs/promises";

/**
 * 🎓 TsDepthScorer — PhD in TypeScript structural depth.
 */
export class TsDepthScorer {
    private static readonly KIND_SCORES: Record<number, number> = {
        [ts.SyntaxKind.IfStatement]: 5, [ts.SyntaxKind.ForOfStatement]: 5, [ts.SyntaxKind.ForInStatement]: 5,
        [ts.SyntaxKind.SwitchStatement]: 5, [ts.SyntaxKind.TryStatement]: 5,
        [ts.SyntaxKind.InterfaceDeclaration]: 2, [ts.SyntaxKind.TypeAliasDeclaration]: 2, [ts.SyntaxKind.EnumDeclaration]: 2,
        [ts.SyntaxKind.JsxElement]: 10, [ts.SyntaxKind.JsxSelfClosingElement]: 10
    };

    static async calculate(filePath: string, depthWeight: number): Promise<number> {
        if (!await exists(filePath)) return 0;
        const sourceFile = ts.createSourceFile(filePath, await readFile(filePath, "utf-8"), ts.ScriptTarget.Latest, true);
        let score = 0;

        const walk = (node: ts.Node) => {
            score += this.KIND_SCORES[node.kind] || 0;

            if (ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
                // Delegate Pattern Detection (Short body = lower score)
                const isDelegate = ts.isMethodDeclaration(node) && node.body?.statements.length === 1;
                score += isDelegate ? 1 : 10;
            }

            if (ts.isIdentifier(node)) {
                const text = node.text;
                if (/SyntaxKind|ast|Node/.test(text)) score += 5;
                if (/shouldSkip|isSafe|veto|audit/.test(text)) score += 3;
            }
            ts.forEachChild(node, walk);
        };

        walk(sourceFile);
        return score + depthWeight;
    }
}
