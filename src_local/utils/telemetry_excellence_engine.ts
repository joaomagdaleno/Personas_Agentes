import winston from "winston";
import * as ts from "typescript";
import { TELEMETRY_KEYWORDS, CRITICAL_LOG_METHODS } from "../agents/Support/Security/safety_definitions.ts";
import { ASTIntelligence } from "./ast_intelligence.ts";

const logger = winston.child({ module: "TelemetryExcellenceEngine" });

/**
 * 📡 Telemetry Excellence Engine (High-Fidelity TypeScript Version).
 * Consolida 5 módulos legacy:
 * - telemetry_intent_judge.py
 * - telemetry_maturity_logic.py
 * - intent_heuristics_engine.py
 * - test_discovery_logic.py
 * - test_core_depth.py
 * 
 * Melhorias sobre a versão legacy:
 * 1. Análise semântica via TypeScript Compiler API (AST).
 * 2. Detecção de "Intenção de Telemetria" atômica.
 * 3. Validação de fluxos críticos com telemetria manual (Gera alerta HIGH).
 */
export class TelemetryExcellenceEngine {
    private ast: ASTIntelligence;

    constructor() {
        this.ast = new ASTIntelligence();
    }

    /**
     * Julga a intencionalidade do uso de telemetria em um nó.
     */
    public judgeIntent(node: ts.Node, sourceFile: ts.SourceFile): { isSafe: boolean; severity: string; reason: string } {
        // 1. Verificar se está dentro de um reporte crítico (EXCEÇÃO SEM TELEMETRIA PADRÃO)
        if (this.isInsideCriticalReport(node, sourceFile)) {
            return {
                isSafe: false,
                severity: "HIGH",
                reason: "Telemetria manual em fluxo de erro crítico. Use _log_performance para integridade."
            };
        }

        // 2. Verificar se é apenas cálculo de duração para log futuro (STRATEGIC)
        if (this.isAssignedToTelemetryVariable(node)) {
            return {
                isSafe: false,
                severity: "STRATEGIC",
                reason: "Cálculo de duração manual detectado. Sugestão: Migrar para utilitário soberano."
            };
        }

        // 3. Verificar subtração simples de tempo
        if (this.isSimpleTimeSubtraction(node)) {
            return {
                isSafe: false,
                severity: "STRATEGIC",
                reason: "Subtração manual de tempo detectada."
            };
        }

        return { isSafe: true, severity: "INFO", reason: "Uso de tempo monitorado ou seguro." };
    }

    private isInsideCriticalReport(node: ts.Node, sourceFile: ts.SourceFile): boolean {
        const chain = ASTIntelligence.getParentChain(node);
        return chain.some((parent: ts.Node) => ASTIntelligence.isCallTo(parent, CRITICAL_LOG_METHODS));
    }

    private isAssignedToTelemetryVariable(node: ts.Node): boolean {
        if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) {
            const name = node.name.getText();
            return TELEMETRY_KEYWORDS.some(k => name.toLowerCase().includes(k));
        }
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const left = node.left.getText();
            return TELEMETRY_KEYWORDS.some(k => left.toLowerCase().includes(k));
        }
        return false;
    }

    private isSimpleTimeSubtraction(node: ts.Node): boolean {
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.MinusToken) {
            const text = node.getText().toLowerCase();
            return text.includes("date") || text.includes("now") || text.includes("time");
        }
        return false;
    }

    /**
     * Score de maturidade baseado na densidade de telemetria.
     */
    public calculateMaturity(telemetryCount: number, totalNodes: number): number {
        if (totalNodes === 0) return 0;
        const ratio = telemetryCount / totalNodes;
        return Math.min(100, Math.round(ratio * 1000)); // Escala PHD
    }
}
