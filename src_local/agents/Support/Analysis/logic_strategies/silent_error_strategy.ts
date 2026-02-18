import * as ts from "typescript";
import { ASTIntelligence } from "../../../../utils/ast_intelligence.ts";

export class SilentErrorStrategy {
    /**
     * Varre um arquivo em busca de erros lógicos silenciados (try/catch vazio ou continue).
     */
    static audit(sourceFile: ts.SourceFile): any[] {
        const issues: any[] = [];

        function visitor(node: ts.Node) {
            if (ts.isCatchClause(node)) {
                const statements = node.block.statements;
                let isSilent = false;

                // 1. Bloco totalmente vazio
                if (statements.length === 0) {
                    isSilent = true;
                }
                // 2. Bloco contendo apenas 'continue' (silenciamento em loop)
                else if (statements.length === 1 && ts.isContinueStatement(statements[0]!)) {
                    isSilent = true;
                }
                // 3. Bloco contendo apenas declaração vazia (;)
                else if (statements.length === 1 && ts.isEmptyStatement(statements[0]!)) {
                    isSilent = true;
                }

                if (isSilent) {
                    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

                    // Verificar se o contexto é seguro (Log ou Teste)
                    if (!ASTIntelligence.isNodeSafe(node, sourceFile)) {
                        issues.push({
                            file: sourceFile.fileName,
                            line: line + 1,
                            column: character + 1,
                            issue: "Captura de erro silenciosa detectada (Try/Catch vazio ou suprimido).",
                            severity: "high",
                            context: "LogicAuditor"
                        });
                    }
                }
            }
            ts.forEachChild(node, visitor);
        }

        ts.forEachChild(sourceFile, visitor);
        return issues;
    }
}
