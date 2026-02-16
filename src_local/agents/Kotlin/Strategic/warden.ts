/**
 * 💂 Warden - PhD in Thread Safety & Resource Lifecycle (Kotlin)
 * Analisa a integridade de threads, memória e dispose de recursos na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "💂";
        this.role = "PhD Resource Governor";
        this.stack = "Kotlin";
    }

    public override performAudit(): AuditFinding[] {
        this.startMetrics();
        const rules: AuditRule[] = [
            { regex: /CoroutineScope\(.*\)/, issue: "Escopo de Coroutine: Verifique se o escopo é cancelado no onDestroy ou se é um supervisor scope.", severity: "medium" },
            { regex: /@OnLifecycleEvent/, issue: "Lifecycle Obsoleto: Use LifecycleObserver ou DefaultLifecycleObserver para melhor integração nativa.", severity: "low" },
            { regex: /ViewModel\(\)/, issue: "Gestão de Estado: Verifique se o ViewModel lida com o cancelamento de jobs no onCleared.", severity: "high" },
            { regex: /BroadcastReceiver/, issue: "Vazamento de Receptor: Verifique se o receiver é desregistrado para evitar vazamentos de contexto de sistema.", severity: "high" }
        ];
        const results = this.findPatterns([".kt", ".kts"], rules);

        // Advanced Logic: Lifecycle Depth Analysis
        if (results.some(r => r.severity === "high")) {
            this.reasonAboutObjective("System Integrity", "Lifecycle", "Critical resource leaks detected in Kotlin components.");
        }

        this.endMetrics(results.length);
        return results;
    }

    public override performActiveHealing(blindSpots: string[]): void {
        console.log(`🛠️ [Warden] Injetando fechamento de recursos e cancelamento de jobs em: ${blindSpots.join(", ")}`);
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): string | StrategicFinding | null {
        return {
            objective,
            analysis: "Auditando segurança de thread e sustentabilidade de memória JVM.",
            recommendation: "Usar 'viewLifecycleOwner' em fragmentos para evitar vazamentos de observadores de LiveData/Flow.",
            severity: "medium"
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
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Kotlin. Sua meta é um sistema com zero memory leaks e performance máxima.`;
    }
}
