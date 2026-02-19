import * as ts from "typescript";
import winston from "winston";
import { SilentErrorStrategy } from "./logic_strategies/silent_error_strategy.ts";
import { VetoStrategy } from "./logic_strategies/veto_strategy.ts";
import { SafetyStrategy } from "./logic_strategies/safety_strategy.ts";

const logger = winston.child({ module: "StructuralAuditorSupreme" });

/**
 * 🏗️ Structural Auditor Supreme (PhD Version).
 * Unifica a auditoria estrutural delegando para estratégias modulares.
 */
export class StructuralAuditorSupreme {
    constructor() { }

    /**
     * Valida um arquivo TypeScript em busca de falhas estruturais.
     */
    public auditFile(sourceFile: ts.SourceFile, ctx: { domain: string; isTechnical: boolean }): any[] {
        const issues: any[] = [];

        // 1. Auditoria de Erros Silenciosos (Delegada)
        issues.push(...SilentErrorStrategy.audit(sourceFile));

        // 2. Scan de Nós Recursivo (Veto & Core Logic)
        this.walk(sourceFile, sourceFile, issues, ctx);

        return issues;
    }

    private walk(node: ts.Node, sourceFile: ts.SourceFile, issues: any[], ctx: { domain: string; isTechnical: boolean }): void {
        // Veto Strategy
        if (VetoStrategy.isVetoed(node, sourceFile, ctx)) return;

        // Custom structural checks can be added here

        ts.forEachChild(node, (child) => this.walk(child, sourceFile, issues, ctx));
    }

    /**
     * Interface de compatibilidade para o AuditExpertEngine.
     */
    public isInteractionSafe(content: string, line: number, riskType: string): { isSafe: boolean; reason: string } {
        // Implementação simplificada delegando para SafetyStrategy
        // Nota: A SafetyStrategy atual pode precisar de adaptação para aceitar número de linha
        return SafetyStrategy.isInteractionSafe(content, "temp.ts");
    }
}

// Nota: Classes Legadas (LineVeto, etc) foram removidas pois não possuem dependências ativas.
