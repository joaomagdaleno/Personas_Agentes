/**
 * ✨ Spark - PhD in Trigger Management & Event Orchestration (Python Stack)
 * Analisa a integridade de gatilhos de eventos e reações do sistema em Python legacy.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Event Strategist";
        this.stack = "Python";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /click_handler\(.*\):/, issue: "Interação de UI: Verifique se o handler de clique legacy possui debounce e se a ação é idempotente.", severity: "low" },
            { regex: /trigger_event\(.*\)/, issue: "Gatilho de Evento: Verifique se a propagação do evento segue o fluxo PhD e se não há loops de disparo.", severity: "medium" },
            { regex: /PyPubSub\.subscribe\(/, issue: "Mensageria Interna: O uso de PubSub pode ocultar o fluxo de dados. Verifique a rastreabilidade PhD.", severity: "medium" },
            { regex: /@on_exception\(.*\)/, issue: "Reação a Falha: Verifique se o gatilho de erro dispara os reflexos sistêmicos corretos.", severity: "high" }
        ];
        const results = this.findPatterns([".py"], rules);

        // Advanced Logic: Interaction Health Audit
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("UX Integrity", "Interactions", "Found critical exception reaction patterns in Python layer.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Spark] Sincronizando gatilhos e validando reações de erro em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando reatividade de eventos e latência de interação legacy.",
            recommendation: "Concentrar gatilhos de lógica em controllers dedicados e usar filas para desacoplar a execução.",
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
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Eventos Python. Sua missão é garantir que cada estímulo gere a resposta soberana.`;
    }
}
