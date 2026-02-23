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
                checkCatchClause(node);
            }
            ts.forEachChild(node, visitor);
        }

        function checkCatchClause(node: ts.CatchClause) {
            if (isSilentCatch(node) && !ASTIntelligence.isNodeSafe(node, sourceFile)) {
                addIssue(node);
            }
        }

        function isSilentCatch(node: ts.CatchClause): boolean {
            const statements = node.block.statements;
            if (statements.length === 0) return true;
            if (statements.length > 1) return false;

            const first = statements[0]!;
            return ts.isContinueStatement(first) || ts.isEmptyStatement(first);
        }

        function addIssue(node: ts.Node) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            issues.push({
                file: sourceFile.fileName,
                line: line + 1,
                column: character + 1,
                issue: "Captura de erro silenciosa detectada (Try/Catch vazio ou suprimido).",
                severity: "high",
                context: "LogicAuditor"
            });
        }

        ts.forEachChild(sourceFile, visitor);
        return issues;
    }
}
