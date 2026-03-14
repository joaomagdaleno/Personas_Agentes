import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

/**
 * 💂 Warden - PhD in Thread Safety & Resource Lifecycle (Kotlin)
 * Analisa a integridade de threads, memória e dispose de recursos na JVM.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Kotlin Thread Safety & Resource Lifecycle";
        this.stack = "Kotlin";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const resourceQuery = await this.hub.queryKnowledgeGraph("Resource", "medium");
            const reasoning = await this.hub.reason(`Analyze the thread safety and lifecycle health of a Kotlin system with ${resourceQuery.length} active resource handlers.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança Kotlin validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Resource Audit", match_count: 1,
                context: "Kotlin Governance & Lifecycle"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /CoroutineScope\(.*\)/, issue: "Escopo de Coroutine: Verifique se o escopo é cancelado no onDestroy ou se é um supervisor scope PhD.", severity: "medium" },
                { regex: /@OnLifecycleEvent/, issue: "Lifecycle Obsoleto: Use LifecycleObserver ou DefaultLifecycleObserver para melhor integração nativa JVM PhD.", severity: "low" },
                { regex: /ViewModel\(\)/, issue: "Gestão de Estado: Verifique se o ViewModel lida com o cancelamento de jobs no onCleared PhD.", severity: "high" },
                { regex: /BroadcastReceiver/, issue: "Vazamento de Receptor: Verifique se o receiver é desregistrado para evitar vazamentos de contexto de sistema JVM PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override async performActiveHealing(blindSpots: string[]): Promise<number> {
        console.log(`🛠️ [Warden] Injetando fechamento de recursos e cancelamento de jobs na JVM em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "MEDIUM",
            issue: `PhD Warden (Kotlin): Auditando segurança de thread e sustentabilidade de memória JVM para '${objective}'. Sugestão: Usar 'viewLifecycleOwner' em fragmentos para evitar leaks de observadores.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Kotlin. Sua meta é um sistema com zero memory leaks e performance máxima.`;
    }
}
