import * as ts from "typescript";
import winston from "winston";
import { ASTIntelligence } from "../../utils/ast_intelligence.ts";

const logger = winston.child({ module: "LogicAuditor" });

/**
 * 🕵️ LogicAuditor — PhD in Logical Integrity & Semantic Pattern Matching
 * Auditor de Lógica: Identifica anti-padrões e falhas estruturais.
 */
export class LogicAuditor {
    /**
     * Varre um arquivo em busca de erros lógicos silenciados (try/catch vazio).
     */
    static auditSilentErrors(sourceFile: ts.SourceFile): any[] {
        const issues: any[] = [];

        function visitor(node: ts.Node) {
            if (ts.isCatchClause(node)) {
                // Se o corpo do catch estiver vazio ou tiver apenas 'pass' (ou equivalente)
                if (node.block.statements.length === 0) {
                    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

                    // Verificar se o contexto é seguro (Log ou Teste)
                    if (!ASTIntelligence.isNodeSafe(node, sourceFile)) {
                        issues.push({
                            file: sourceFile.fileName,
                            line: line + 1,
                            column: character + 1,
                            issue: "Captura de erro silenciosa detectada (Try/Catch vazio).",
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
