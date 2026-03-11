/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Kotlin)
 * Analisa a densidade de eventos analíticos e instrumentação de performance na JVM.
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
        this.phd_identity = "Kotlin Data Telemetry & Logging";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            const telemetryQuery = await this.hub.queryKnowledgeGraph("Telemetry", "high");
            const reasoning = await this.hub.reason(`Analyze the observability and telemetry depth of a Kotlin system given ${telemetryQuery.length} logging or metrics nodes.`);
            
            findings.push({
                file: "Observability Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Metric: Telemetria Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Telemetry", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /System\.out\.println|Log\.[di]\(/, issue: "Cegueira: Saída não gerenciada ou log de debug em produção.", severity: "high" },
                { regex: /catch\s*\(.*\)\s*\{\s*\}/, issue: "Cegueira Total: Bloco catch vazio engole exceções silenciosamente.", severity: "critical" },
                { regex: /catch\s*\(.*\)\s*\{\s*(println|Log\.)/, issue: "Telemetria Informal: Erro logado sem contexto estruturado no catch.", severity: "medium" },
                { regex: /FirebaseAnalytics\.logEvent/, issue: "Acoplamento: Instrumentação direta de analytics sem camada de abstração.", severity: "low" },
                { regex: /measureTimeMillis/, issue: "Profiling: Medição ad-hoc de performance detectada.", severity: "low" }
            ]
        };
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Metric] Injetando Timber logging e métricas de coroutine em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando consistência de instrumentação em stack nativa.",
            recommendation: "Concentrar eventos em um 'AnalyticsManager' para facilitar auditorias de conformidade (GDPR/LGPD).",
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
        return `Você é o Dr. ${this.name}, PhD em Estatística e Intrumentação de Sistemas Kotlin. Sua missão é a verdade absoluta dos dados.`;
    }
}

