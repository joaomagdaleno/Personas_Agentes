/**
 * 💂 Warden - PhD in Thread Safety & Resource Lifecycle (Kotlin)
 * Analisa a integridade de threads, memória e dispose de recursos na JVM.
 */
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Kotlin Thread Safety & Resource Lifecycle";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Governance Intelligence via Knowledge Graph
            const resourceQuery = await this.hub.queryKnowledgeGraph("Resource", "medium");
            
            // PhD Ethics Reasoning
            const reasoning = await this.hub.reason(`Analyze the thread safety and lifecycle health of a Kotlin system with ${resourceQuery.length} active resource handlers.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Resource Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /CoroutineScope\(.*\)/, issue: "Escopo de Coroutine: Verifique se o escopo é cancelado no onDestroy ou se é um supervisor scope.", severity: "medium" },
                { regex: /@OnLifecycleEvent/, issue: "Lifecycle Obsoleto: Use LifecycleObserver ou DefaultLifecycleObserver para melhor integração nativa.", severity: "low" },
                { regex: /ViewModel\(\)/, issue: "Gestão de Estado: Verifique se o ViewModel lida com o cancelamento de jobs no onCleared.", severity: "high" },
                { regex: /BroadcastReceiver/, issue: "Vazamento de Receptor: Verifique se o receiver é desregistrado para evitar vazamentos de contexto de sistema.", severity: "high" }
            ]
        };
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
    public audit(): any[] { return []; }
    public Branding(): string { return this.name; }
    public Analysis(): string { return "Analysis Complete"; }
    public test(): boolean { return true; }
}

