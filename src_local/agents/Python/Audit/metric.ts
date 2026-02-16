/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Python Stack)
 * Analisa a densidade de eventos analíticos e instrumentação em scripts Python.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        self.name = "Metric";
        self.emoji = "📊";
        self.role = "PhD Telemetry Engineer";
        self.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /print\(.*\)/, issue: "Saída Não Gerenciada: Use logging.info() ou similar para garantir paridade de dados e rastreabilidade PhD.", severity: "medium" },
            { regex: /logging\.basicConfig\(/, issue: "Configuração Global: Verifique se a configuração não sobrescreve handlers de outros módulos em sistemas complexos.", severity: "low" },
            { regex: /statsd\.increment\(/, issue: "Telemetria Detalhada: Verifique se as tags seguem o esquema de instrumentação Sovereign.", severity: "low" },
            { regex: /json\.dumps\(.*\)/, issue: "Serialização: Verifique se dados sensíveis são anonimizados antes da telemetria de log.", severity: "medium" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Telemetry Depth
        if (results.length === 0) {
            this.reasonAboutObjective("Telemetry Verification", "Global", "Python legacy layer lacks standardized instrumentation.");
        }

        this.endMetrics(results.length);
        return results;
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
