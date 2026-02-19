import * as ts from "typescript";
import { ASTIntelligence } from "../../../../utils/ast_intelligence.ts";

export class VetoStrategy {
    /**
     * Determina se um nó deve ser ignorado na auditoria.
     */
    static isVetoed(node: ts.Node, sourceFile: ts.SourceFile, ctx: { domain: string; isTechnical: boolean; inDocstring?: boolean }): boolean {
        // 1. Veto de Comentários
        if (this.isComment(node)) return true;

        // 2. Veto de Docstrings (JSDoc)
        if (this.isDocstring(node, ctx)) return true;

        // 3. Veto por Domínio: Se for EXPERIMENTATION, ignorar não-críticos
        if (ctx.domain === "EXPERIMENTATION" && !this.isCriticalRisk(node)) {
            return true;
        }

        // 4. Veto de Definições Técnicas: Ignorar se estiver em contexto de regras
        if (ctx.isTechnical && this.isRuleDefinition(node)) {
            return true;
        }

        return false;
    }

    private static isComment(node: ts.Node): boolean {
        const text = node.getFullText();
        const trimmed = text.trim();
        return trimmed.startsWith("//") || trimmed.startsWith("/*");
    }

    private static isDocstring(node: ts.Node, ctx: { inDocstring?: boolean }): boolean {
        const text = node.getText();
        if (text.startsWith("/**") || text.startsWith("/*")) return true;
        return ctx.inDocstring || false;
    }

    private static isCriticalRisk(node: ts.Node): boolean {
        const text = node.getText().toLowerCase();
        return text.includes("eval(") || text.includes("exec(");
    }

    private static isRuleDefinition(node: ts.Node): boolean {
        const text = node.getText();
        return ["patterns", "rules", "regex", "diretriz"].some(kw => text.includes(kw));
    }
}
