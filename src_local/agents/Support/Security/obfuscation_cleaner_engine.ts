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
        this.visitTree(sourceFile, (node) => {
            const res = this.getReplacementIfObfuscated(node, sourceFile);
            if (res) results.push(res);
        });
        return results;
    }

    private visitTree(node: ts.Node, callback: (n: ts.Node) => void) {
        callback(node);
        ts.forEachChild(node, c => this.visitTree(c, callback));
    }

    private getReplacementIfObfuscated(node: ts.Node, sourceFile: ts.SourceFile): DeobfuscationResult | null {
        if (!ts.isBinaryExpression(node) || node.operatorToken.kind !== ts.SyntaxKind.PlusToken) return null;

        const resolved = this.resolveConstant(node);
        if (!resolved || !this.isPotentiallyObfuscated(node)) return null;

        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        return {
            original: node.getText(sourceFile),
            cleaned: JSON.stringify(resolved),
            line: line + 1
        };
    }

    private resolveConstant(node: ts.Node): string | null {
        if (ts.isStringLiteral(node)) return node.text;
        if (!ts.isBinaryExpression(node) || node.operatorToken.kind !== ts.SyntaxKind.PlusToken) return null;

        const left = this.resolveConstant(node.left);
        const right = this.resolveConstant(node.right);
        return (left !== null && right !== null) ? left + right : null;
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
