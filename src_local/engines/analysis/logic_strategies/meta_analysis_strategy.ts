import * as ts from "typescript";
import { ASTIntelligence } from "../../../utils/ast_intelligence.ts";

export class MetaAnalysisStrategy {
    /**
     * Detecta padrões de Meta-Análise (Introspecção, AST, Eval).
     */
    static audit(node: ts.Node, sourceFile: ts.SourceFile): { isMeta: boolean, reason: string } {
        if (ASTIntelligence.isNodeSafe(node, sourceFile)) return { isMeta: false, reason: "" };

        const text = node.getText();
        // Detectar uso de TS Compiler API fora de agentes autorizados
        if (text.includes("ts.createSourceFile") || text.includes("ts.forEachChild")) {
            return { isMeta: true, reason: "Meta-análise detectada (Uso de TypeScript Compiler API)." };
        }
        // Detectar eval/Function
        if (text.includes("eval(") || text.includes("new Function(")) {
            return { isMeta: true, reason: "Meta-análise detectada (Execução dinâmica de código)." };
        }

        return { isMeta: false, reason: "" };
    }
}
