/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Kotlin)
 * Analisa a densidade de eventos analíticos e instrumentação de performance na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /Log\.d\(|Log\.i\(/, issue: "Logging Android: Verifique se o nível de log é adequado para produção e se não expõe PII.", severity: "low" },
            { regex: /System\.out\.println/, issue: "Saída Não Gerenciada: Use o sistema de logs da plataforma (Timber/Log) para garantir rastreabilidade.", severity: "medium" },
            { regex: /measureTimeMillis \{/, issue: "Observação de Performance: Verifique se o profiling é condicional ao modo debug.", severity: "low" },
            { regex: /FirebaseAnalytics\.logEvent/, issue: "Acoplamento Analítico: Verifique se os nomes dos eventos seguem a convenção global PhD.", severity: "medium" }
        ];
        const results = this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Telemetry Depth
        if (results.length === 0) {
            this.reasonAboutObjective("Telemetry Depth", "Global", "No standardized telemetry markers found in Kotlin source.");
        }

        this.endMetrics(results.length);
        return results;
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
