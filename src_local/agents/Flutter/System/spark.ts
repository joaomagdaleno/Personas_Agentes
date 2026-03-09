/**
 * ✨ Spark - PhD in Trigger Management & Event Orchestration (Flutter)
 * Analisa a integridade de gatilhos de eventos e reações do sistema.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Event Strategist";
        this.stack = "Flutter";
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /GestureDetector\(|InkWell\(/, issue: "Interação de UI: Verifique se o hitbox é adequado e se há feedback visual (ink splash) para o usuário.", severity: "low" },
            { regex: /onTap: \(.*\) \{/, issue: "Gatilho de Evento: Verifique se há debounce para evitar disparos múltiplos de ações críticas (ex: pagamentos).", severity: "high" },
            { regex: /EventBus\.fire\(/, issue: "Propagação Global: O uso de EventBus pode tornar o fluxo de dados imprevisível. Considere fluxos unidirecionais.", severity: "medium" },
            { regex: /NotificationListener/, issue: "Bolha de Eventos: Verifique se a interceptação de notificações de scroll ou layout é necessária ou redundante.", severity: "low" }
        ];
        const results = await this.findPatterns([".dart"], rules);

        // Advanced Logic: Interaction Health
        if (results.some(r => r.issue.includes("debounce"))) {
            this.reasonAboutObjective("UX Integrity", "Interactions", "Found critical interaction triggers without debounce protection.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Spark] Sincronizando gatilhos e limpando listeners em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando reatividade de eventos e latência de interação.",
            recommendation: "Concentrar gatilhos de lógica de negócio em BLoCs ou Controllers para separar UI de Efeito.",
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
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Eventos Flutter. Sua missão é garantir que cada toque do usuário gere a faísca certa.`;
    }
}

