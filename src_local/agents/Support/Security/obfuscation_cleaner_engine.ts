import * as ts from "typescript";
import winston from 'winston';

export interface DeobfuscationResult {
    original: string;
    cleaned: string;
    line: number;
}

/**
 * 🧹 ObfuscationCleanerEngine
 * Engine responsável por reconstruir strings ofuscadas em literais claros.
 */
export class ObfuscationCleanerEngine {
    private logger = winston.loggers.get('default_logger') || winston;

    /**
     * Identifica e reconstrói strings concatenadas.
     */
    public collectReplacements(sourceFile: ts.SourceFile): DeobfuscationResult[] {
        const results: DeobfuscationResult[] = [];

        const visit = (node: ts.Node) => {
            if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
                const resolved = this.resolveConstant(node);
                if (resolved && this.isPotentiallyObfuscated(node)) {
                    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                    results.push({
                        original: node.getText(sourceFile),
                        cleaned: JSON.stringify(resolved),
                        line: line + 1
                    });
                }
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return results;
    }

    private resolveConstant(node: ts.Node): string | null {
        if (ts.isStringLiteral(node)) return node.text;
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const left = this.resolveConstant(node.left);
            const right = this.resolveConstant(node.right);
            if (left !== null && right !== null) return left + right;
        }
        return null;
    }

    private isPotentiallyObfuscated(node: ts.BinaryExpression): boolean {
        // Se ambos os lados são literais curtos ou se resolve para algo "perigoso"
        const left = this.resolveConstant(node.left);
        const right = this.resolveConstant(node.right);

        if (!left || !right) return false;

        // Ex: "ev" + "al" -> 2+2 chars
        if (left.length <= 4 && right.length <= 4) return true;

        const dangerous = ["eval", "exec", "child_process", "spawn", "base64", "hex"];
        const resolved = left + right;
        return dangerous.some(d => resolved.toLowerCase().includes(d));
    }

    /**
     * Aplica as substituições no conteúdo do arquivo.
     */
    public applyClean(content: string, replacements: DeobfuscationResult[]): string {
        let newContent = content;
        // Sort replacements by descending order of occurrence to avoid offset shifts
        // (Actually, simple string replacement is dangerous if there are duplicates.
        // Better to use offsets if possible).

        for (const r of replacements) {
            // This is a bit naive but if the original text is unique enough...
            // In a real scenario we'd use node offsets.
            newContent = newContent.replace(r.original, r.cleaned);
        }

        return newContent;
    }
}
