import * as ts from "typescript";
import { ASTIntelligence } from "../../../utils/ast_intelligence.ts";

export class ObservabilityStrategy {
    /**
     * Valida se um log contém telemetria manual que deve ser padronizada.
     */
    static audit(node: ts.Node, sourceFile: ts.SourceFile): { isSafe: boolean, reason: string } {
        // Apenas processamos a chamada completa ou acesso direto para evitar redundância
        if (!ts.isCallExpression(node) && !ts.isPropertyAccessExpression(node)) return { isSafe: true, reason: "" };

        // Se estiver em contexto de teste ou metadata, ignora
        if (ASTIntelligence.isNodeSafe(node, sourceFile)) {
            return { isSafe: true, reason: "Contexto seguro: Telemetria permitida." };
        }

        const text = node.getText();
        if (text.includes("performance.now()") || text.includes("Date.now()") || text.includes("console.time")) {
            // Permitir se for atribuição para variável de start (s, start, startTime)
            let curr: ts.Node | undefined = node;
            while (curr && !ts.isVariableDeclaration(curr)) {
                curr = curr.parent;
            }

            if (curr && ts.isVariableDeclaration(curr)) {
                const varName = curr.name.getText();
                if (/^s$|^start/i.test(varName)) {
                    return { isSafe: true, reason: "Início de captura de métricas permitido." };
                }
            }

            return {
                isSafe: false,
                reason: "Telemetria manual detectada. Use o sistema de logs padronizado do Orquestrador. [Severity: STRATEGIC]"
            };
        }

        return { isSafe: true, reason: "Log informativo seguro." };
    }
}
