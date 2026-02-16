import * as ts from "typescript";
import winston from "winston";
import { ASTIntelligence } from "../../../utils/ast_intelligence.ts";

const logger = winston.child({ module: "LogicAuditor" });

/**
 * 🕵️ LogicAuditor — PhD in Logical Integrity & Semantic Pattern Matching
 * Auditor de Lógica: Identifica anti-padrões e falhas estruturais.
 */
export class LogicAuditor {
    /**
     * Varre um arquivo em busca de erros lógicos silenciados (try/catch vazio).
     */
    /**
     * Realiza uma auditoria completa no arquivo (Silent Errors, Telemetria, Meta-Análise).
     */
    static scanFile(sourceFile: ts.SourceFile): any[] {
        const issues: any[] = [];

        // 1. Silent Errors
        issues.push(...this.auditSilentErrors(sourceFile));

        // 2. Node Scanning (Observability + Meta-Analysis)
        function visitor(node: ts.Node) {
            // Observability Check
            const obsCheck = LogicAuditor.auditObservability(node, sourceFile);
            if (!obsCheck.isSafe) {
                issues.push({
                    file: sourceFile.fileName,
                    line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                    issue: obsCheck.reason,
                    severity: "strategic",
                    context: "LogicAuditor"
                });
            }

            // Meta-Analysis Check
            const metaCheck = LogicAuditor.auditMetaAnalysis(node, sourceFile);
            if (metaCheck.isMeta) {
                issues.push({
                    file: sourceFile.fileName,
                    line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                    issue: metaCheck.reason,
                    severity: "strategic",
                    context: "LogicAuditor"
                });
            }

            ts.forEachChild(node, visitor);
        }
        ts.forEachChild(sourceFile, visitor);

        return issues;
    }

    /**
     * Varre um arquivo em busca de erros lógicos silenciados (try/catch vazio ou continue).
     */
    static auditSilentErrors(sourceFile: ts.SourceFile): any[] {
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

    /**
     * Valida se um log contém telemetria manual que deve ser padronizada.
     */
    /**
     * Valida se um log contém telemetria manual que deve ser padronizada.
     */
    static auditObservability(node: ts.Node, sourceFile: ts.SourceFile): { isSafe: boolean, reason: string } {
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

    /**
     * Detecta padrões de Meta-Análise (Introspecção, AST, Eval).
     */
    static auditMetaAnalysis(node: ts.Node, sourceFile: ts.SourceFile): { isMeta: boolean, reason: string } {
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
