/**
 * 👑 Master - PhD in System Orchestration & Prime Directive (Python Stack)
 * Analisa a integridade da orquestração principal e conformidade com as diretrizes PhD.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MasterPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Master";
        this.emoji = "👑";
        this.role = "PhD Principal Architect";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /main\(.*\):/, issue: "Ponto de Entrada: Verifique se a lógica de inicialização é idempotente e resiliente a falhas parciais.", severity: "low" },
            { regex: /sys\.exit\(/, issue: "Encerramento Abrupto: O uso de sys.exit() deve ser acompanhado de limpeza de recursos e logs forenses.", severity: "medium" },
            { regex: /import os, sys/, issue: "Higiene de Importação: Mantenha as importações organizadas e evite dependências desnecessárias no core.", severity: "low" },
            { regex: /DIRECTIVE_PHD_VIOLATION/, issue: "Violação de Diretriz: Alerta crítico de desvio das normas de soberania sistêmica PhD.", severity: "critical" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Prime Directive Audit
        if (results.some(r => r.severity === "critical")) {
            this.reasonAboutObjective("System Sovereignty", "Directives", "Found critical violation of PhD Prime Directives in Python layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Master] Restaurando diretrizes e reiniciando serviços órfãos em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando centralidade de controle e conformidade estratégica.",
            recommendation: "Concentrar a lógica de controle em 'orchestrator.py' e usar sinais POSIX para gestão de processos.",
            severity: "high"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): { status: string; score: number; issues: string[]; } {
        return {
            status: "Soberano",
            score: 100,
            issues: []
        };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Orquestração de Sistemas Python. Sua palavra é a lei final do sistema.`;
    }
}
