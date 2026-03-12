/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Python Stack)
 * Analisa a densidade de eventos analíticos e instrumentação em scripts Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.phd_identity = "Python Data Telemetry & Logging";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const telemetryQuery = await this.hub.queryKnowledgeGraph("Telemetry", "high");
            const reasoning = await this.hub.reason(`Analyze the observability and telemetry depth of a Python system given ${telemetryQuery.length} logging or metrics nodes.`);
            
            findings.push({
                file: "Observability Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Metric: Telemetria Python validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Telemetry", match_count: 1
            } as any);
        }
        return findings;
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

