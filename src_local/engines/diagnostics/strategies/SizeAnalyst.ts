import * as ts from "typescript";

/**
 * 📏 SizeAnalyst — Specialized in code volume and structural depth.
 */
export class SizeAnalyst {
    /**
     * LOC - Lines of Code
     */
    static countLOC(content: string): number {
        return content.split('\n').length;
    }

    /**
     * LOC Executável (não comentário, não vazio)
     */
    static countExecutableLOC(content: string): number {
        const lines = content.split('\n');
        return lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
        }).length;
    }

    /**
     * LOC de Comentários
     */
    static countCommentLOC(content: string): number {
        const lines = content.split('\n');
        return lines.filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
        }).length;
    }

    /**
     * Profundidade de Aninhamento (AST based)
     */
    static calculateNestingDepth(content: string): number {
        const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
        let maxDepth = 0;

        const nestableKinds = new Set([
            ts.SyntaxKind.IfStatement,
            ts.SyntaxKind.WhileStatement,
            ts.SyntaxKind.DoStatement,
            ts.SyntaxKind.ForStatement,
            ts.SyntaxKind.ForInStatement,
            ts.SyntaxKind.ForOfStatement,
            ts.SyntaxKind.CatchClause,
            ts.SyntaxKind.SwitchStatement,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.MethodDeclaration,
            ts.SyntaxKind.ArrowFunction,
            ts.SyntaxKind.ClassDeclaration
        ]);

        const analyze = (node: ts.Node, depth: number) => {
            let nextDepth = depth;
            if (nestableKinds.has(node.kind)) {
                nextDepth++;
                maxDepth = Math.max(maxDepth, nextDepth);
            }
            ts.forEachChild(node, (child) => analyze(child, nextDepth));
        };

        ts.forEachChild(sourceFile, (node) => analyze(node, 0));
        return maxDepth;
    }
}
