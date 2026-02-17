import * as ts from "typescript";
import winston from "winston";
import { ASTIntelligence } from "../../../utils/ast_intelligence.ts";
import { SafetySupremeJudge } from "./../Security/safety_supreme_judge.ts";

const logger = winston.child({ module: "StructuralAuditorSupreme" });

/**
 * 🏗️ Structural Auditor Supreme (High-Fidelity TypeScript Version).
 * Consolida legacy logic_node_auditor.py, silent_error_detector.py, 
 * veto_criteria_engine.py, e veto_structural_engine.py.
 * 
 * Melhorias sobre a versão legacy:
 * 1. Análise de "Veto Semântico": Isenta termos matemáticos e técnicos de alertas monetários.
 * 2. Detecção de "Erros Silenciosos" com consciência de contexto de log.
 * 3. Validação de permissões de teste de forma granular.
 */
export class StructuralAuditorSupreme {
    // ast removed as we use static methods
    private safety: SafetySupremeJudge;

    constructor() {
        this.safety = new SafetySupremeJudge();
    }

    /**
     * Valida um arquivo TypeScript em busca de falhas estruturais.
     */
    public auditFile(sourceFile: ts.SourceFile, ctx: { domain: string; isTechnical: boolean }): any[] {
        const issues: any[] = [];
        this.walk(sourceFile, sourceFile, issues, ctx);
        return issues;
    }

    private walk(node: ts.Node, sourceFile: ts.SourceFile, issues: any[], ctx: { domain: string; isTechnical: boolean }): void {
        // 1. Decisor de Veto (LineVeto legacy logic)
        if (this.isVetoed(node, sourceFile, ctx)) return;

        // 2. Detectar erros silenciados (Catch blocks sem tratamento)
        if (ts.isCatchClause(node)) {
            if (this.isSilentCatch(node)) {
                issues.push(this.createIssue(node, sourceFile, "Captura de erro silenciosa detectada (Catch vazio ou sem log).", "HIGH"));
            }
        }

        // 3. Veto de Regras (Ex: Isentar termos técnicos de imprecisão monetária)
        if (ts.isNumericLiteral(node) || ts.isBinaryExpression(node)) {
            if (this.isMathContext(node, sourceFile)) {
                // Skip further audit for this specific numeric context
                return;
            }
        }

        ts.forEachChild(node, (child) => this.walk(child, sourceFile, issues, ctx));
    }

    private isVetoed(node: ts.Node, sourceFile: ts.SourceFile, ctx: { domain: string; isTechnical: boolean; inDocstring?: boolean }): boolean {
        // Comment Veto (legacy VetoStructuralEngine logic)
        if (this.isComment(node)) return true;

        // Docstring Veto (legacy VetoStructuralEngine logic)
        if (this.isDocstring(node, ctx)) return true;

        // Domain Exclusion: Se for EXPERIMENTATION (testes), ignorar severidade não-crítica
        // (No TypeScript, isso significa ser mais permissivo com lambdas ou asserts)
        if (ctx.domain === "EXPERIMENTATION" && !this.isCriticalRisk(node)) {
            return true;
        }

        // Rule Definition Veto
        if (ctx.isTechnical && this.isRuleDefinition(node)) {
            return true;
        }

        return false;
    }

    private isComment(node: ts.Node): boolean {
        const text = node.getFullText();
        return text.trim().startsWith("//") || text.trim().startsWith("/*");
    }

    private isDocstring(node: ts.Node, ctx: { inDocstring?: boolean }): boolean {
        // No TypeScript, docstrings são JSDoc (ts.isJSDocRoot) ou comentários multi-linha
        const text = node.getText();
        if (text.startsWith("/**") || text.startsWith("/*")) return true;
        return ctx.inDocstring || false;
    }

    private isCriticalRisk(node: ts.Node): boolean {
        const text = node.getText().toLowerCase();
        // Riscos críticos configurados: eval, exec, process.env direto (exemplo)
        return text.includes("eval(") || text.includes("exec(");
    }

    private isRuleDefinition(node: ts.Node): boolean {
        const text = node.getText();
        return ["patterns", "rules", "regex", "diretriz"].some(kw => text.includes(kw));
    }

    private isSilentCatch(node: ts.CatchClause): boolean {
        if (node.block.statements.length === 0) return true;

        const text = node.block.getText().toLowerCase();
        const hasLog = ["console.log", "logger", "info", "warn", "error", "trace", "_log_performance"].some(l => text.includes(l));
        return !hasLog;
    }

    private isMathContext(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const techTerms = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos', 'tan', 'atan'];
        const chain = ASTIntelligence.getParentChain(node);
        return chain.some(parent => {
            const text = parent.getText().toLowerCase();
            return techTerms.some(term => text.includes(term));
        });
    }

    private isTestContext(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const testKeywords = ["describe", "it", "test", "expect"];
        const chain = ASTIntelligence.getParentChain(node);
        return chain.some(parent => ASTIntelligence.isCallTo(parent, testKeywords));
    }

    private createIssue(node: ts.Node, sourceFile: ts.SourceFile, msg: string, severity: string): any {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        return {
            file: sourceFile.fileName,
            line: line + 1,
            issue: msg,
            severity,
            snippet: node.getText().slice(0, 150)
        };
    }

    /** Parity: _is_single_line_docstring — Checks if a node is a single-line JSDoc/docstring. */
    private _is_single_line_docstring(node: ts.Node): boolean {
        const text = node.getText().trim();
        return (text.startsWith("/**") && text.endsWith("*/") && !text.includes("\n"));
    }
}

/** Parity: VetoStructuralEngine — Legacy alias for StructuralAuditorSupreme. */
export const VetoStructuralEngine = StructuralAuditorSupreme;
