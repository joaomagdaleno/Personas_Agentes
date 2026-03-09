import * as ts from "typescript";
import winston from "winston";
import { SilentErrorStrategy } from "./logic_strategies/silent_error_strategy.ts";
import { ObservabilityStrategy } from "./logic_strategies/observability_strategy.ts";
import { MetaAnalysisStrategy } from "./logic_strategies/meta_analysis_strategy.ts";
import { SafetyStrategy } from "./logic_strategies/safety_strategy.ts";
import { TestQualityStrategy } from "./logic_strategies/test_quality_strategy.ts";


const logger = winston.child({ module: "LogicAuditor" });

/**
 * 🕵️ LogicAuditor — PhD in Logical Integrity & Semantic Pattern Matching
 * Auditor de Lógica: Identifica anti-padrões e falhas estruturais.
 * Complexity: < 15 (Facade Pattern)
 */
export class LogicAuditor {
    /** Parity: __init__ */
    constructor() {
        // No state needed — all methods are static.
    }

    /**
     * Parity: scan_flaws — Delegates to scanFile for full audit.
     */
    static scan_flaws(sourceFile: ts.SourceFile): any[] {
        return this.scanFile(sourceFile);
    }

    /**
     * Parity: _audit_nodes — Internal node-level audit (observability + meta-analysis).
     */
    static _audit_nodes(sourceFile: ts.SourceFile): any[] {
        const issues: any[] = [];
        function visitor(node: ts.Node) {
            const obsCheck = ObservabilityStrategy.audit(node, sourceFile);
            if (!obsCheck.isSafe) {
                issues.push({ file: sourceFile.fileName, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, issue: obsCheck.reason, severity: "strategic", context: "LogicAuditor" });
            }
            ts.forEachChild(node, visitor);
        }
        ts.forEachChild(sourceFile, visitor);
        return issues;
    }

    /**
     * Realiza uma auditoria completa no arquivo (Silent Errors, Telemetria, Meta-Análise).
     */
    static scanFile(sourceFile: ts.SourceFile): any[] {
        const issues: any[] = [];

        // 1. Silent Errors
        issues.push(...SilentErrorStrategy.audit(sourceFile));

        // 2. Node Scanning (Observability + Meta-Analysis)
        function visitor(node: ts.Node) {
            // Observability Check
            const obsCheck = ObservabilityStrategy.audit(node, sourceFile);
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
            const metaCheck = MetaAnalysisStrategy.audit(node, sourceFile);
            if (metaCheck.isMeta) {
                issues.push({
                    file: sourceFile.fileName,
                    line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                    issue: metaCheck.reason,
                    severity: "strategic",
                    context: "LogicAuditor"
                });
            }

            // Test Quality Check (for .test.ts files)
            if (sourceFile.fileName.endsWith(".test.ts")) {
                const testCheck = TestQualityStrategy.audit(node, sourceFile);
                if (!testCheck.isSafe) {
                    issues.push({
                        file: sourceFile.fileName,
                        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                        issue: testCheck.reason,
                        severity: "high",
                        context: "LogicAuditor"
                    });
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
        return SafetyStrategy.isInteractionSafe(content, fileName);
    }
}
