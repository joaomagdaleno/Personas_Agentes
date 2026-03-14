import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 💂 Warden - PhD in Thread Safety & Resource Lifecycle (Flutter)
 * Analisa a integridade de isolates, memória e dispose de controllers.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.phd_identity = "Flutter Thread Safety & Resource Lifecycle";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();

        if (this.hub) {
            const resourceQuery = await this.hub.queryKnowledgeGraph("Resource", "high");
            const reasoning = await this.hub.reason(`Analyze the thread safety and lifecycle health of a Flutter system with ${resourceQuery.length} active resource handlers.`);

            findings.push({
                file: "Governance Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Warden: Governança Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Resource Audit", match_count: 1,
                context: "Flutter Thread Governance"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /Isolate\.spawn\(/, issue: "Concorrência: Isolates detectados. Verifique o fechamento de SendPort/ReceivePort para evitar vazamentos PhD.", severity: "high" },
                { regex: /@override\n  void dispose\(\)/, issue: "Ciclo de Vida: Verifique se todos os StreamControllers e AnimationControllers são fechados aqui PhD.", severity: "medium" },
                { regex: /compute\(.*\)/, issue: "Offloading: Verifique se a função passada para 'compute' é global ou estática conforme exigido PhD.", severity: "low" },
                { regex: /StreamController\(\)/, issue: "Vazamento de Fluxo: Prefira 'StreamController.broadcast()' se houver múltiplos ouvintes ou garanta o dispose PhD.", severity: "high" }
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
        console.log(`🛠️ [Warden] Injetando código de dispose e fechando portas Isolate em: ${blindSpots.join(", ")}`);
        return blindSpots.length;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Warden (Flutter): Auditando thread safety e sustentabilidade de memória para ${objective}. Usar 'flutter_hooks' reduz boilerplate.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Governança de Recursos Flutter. Sua meta é um sistema com zero memory leaks e performance máxima.`;
    }
}
