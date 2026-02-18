import * as ts from "typescript";
import { ASTIntelligence } from "../../../../utils/ast_intelligence.ts";

export class SafetyStrategy {
    /**
     * Valida se uma interação (linha de código) é segura.
     */
    static isInteractionSafe(content: string, fileName: string): { isSafe: boolean, reason: string } {
        try {
            const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true);

            let result = { isSafe: true, reason: "Uso validado como seguro ou não-executável." };

            function visitor(node: ts.Node) {
                if (ASTIntelligence.isDangerousCall(node)) {
                    if (!ASTIntelligence.isNodeSafe(node, sourceFile)) {
                        result = {
                            isSafe: false,
                            reason: `Chamada perigosa detectada em contexto de execução real: ${node.getText()}`
                        };
                    } else {
                        result = {
                            isSafe: true,
                            reason: "Execução perigosa em contexto seguro (Teste/Log/Definição)."
                        };
                    }
                }
                ts.forEachChild(node, visitor);
            }

            ts.forEachChild(sourceFile, visitor);
            return result;
        } catch (e) {
            return { isSafe: false, reason: `Falha na análise AST: ${e}` };
        }
    }
}
