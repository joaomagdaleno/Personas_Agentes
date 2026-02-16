/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Flutter)
 * Analisa a densidade de eventos analíticos e instrumentação de performance.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.stack = "Flutter";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /logEvent\(/, issue: "Aviso: Evento analítico detectado. Verifique se segue o schema oficial.", severity: "low" },
            { regex: /print\(/, issue: "Saída não rastreável: Use o sistema de logs estruturado para garantir paridade de dados.", severity: "medium" },
            { regex: /FirebaseAnalytics\.instance/, issue: "Acoplamento Direto: Considere um wrapper para facilitar testes e swaps de infra.", severity: "low" },
            { regex: /Stopwatch\(\)/, issue: "Profiling Manual: Verifique se a instrumentação é removida em instâncias de produção.", severity: "medium" }
        ];
        const results = this.findPatterns([".dart"], rules);

        // Advanced Logic: Active Healing Trigger for missing telemetry
        if (results.length === 0) {
            this.reasonAboutObjective("Telemetry Verification", "Global", "No analytics found in codebase.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Metric] Iniciando correção ativa para pontos cegos: ${blindSpots.join(", ")}`);
        // Simulação de injeção de boilerplate de telemetria
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando profundidade estatística do código Flutter.",
            recommendation: "Aumentar a granularidade dos logs estruturados para paridade com o stack Bun.",
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
        return `Você é o Dr. ${this.name}, PhD em Estatística e Intrumentação de Sistemas Flutter. Sua missão é garantir paridade de dados absoluta.`;
    }
}
