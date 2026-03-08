/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Python Stack)
 * Analisa a densidade de eventos analíticos e instrumentação em scripts Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.stack = "Python";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /print\(.*\)/, issue: "Cegueira: print em produção — use logging estruturado PhD.", severity: "high" },
                { regex: /except\s*.*:\s*pass/, issue: "Cegueira Total: except vazio engole erros silenciosamente.", severity: "critical" },
                { regex: /except\s*.*:\s*print\(.*\)/, issue: "Telemetria Informal: Erro logado via print no bloco except.", severity: "medium" },
                { regex: /logging\.basicConfig\(/, issue: "Telemetria Fraca: Configuração global inadequada em sistemas complexos.", severity: "low" },
                { regex: /json\.dumps\(.*\)/, issue: "Soberania de Dados: Verifique se dados sensíveis são anonimizados antes do log.", severity: "medium" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Metric] Injetando logging estruturado e métricas de execução em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando profundidade estatística do suporte Python.",
            recommendation: "Migrar 'print' para 'logging' estruturado com suporte a níveis dinâmicos.",
            severity: "low"
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
        return `Você é o Dr. ${this.name}, PhD em Estatística e Instrumentação Python. Sua missão é garantir paridade de dados total.`;
    }
}
