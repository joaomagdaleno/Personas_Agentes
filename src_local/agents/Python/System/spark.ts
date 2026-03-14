import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ✨ Spark - PhD in Trigger Management & Event Orchestration (Python Stack)
 * Analisa a integridade de gatilhos de eventos e reações do sistema em Python legacy.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Event Strategist";
        this.phd_identity = "Trigger Management & Event Orchestration (Python)";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /click_handler\(.*\):/, issue: "Interação UI: Verifique debounce e idempotência legacy PhD.", severity: "low" },
                { regex: /trigger_event\(.*\)/, issue: "Gatilho de Evento: Verifique propagação PhD sem loops.", severity: "medium" },
                { regex: /PyPubSub\.subscribe\(/, issue: "Mensageria Interna: Oculta fluxo de dados. Rastrei PhD.", severity: "medium" },
                { regex: /@on_exception\(.*\)/, issue: "Reação a Falha: Verifique se gatilho dispara reflexos corretos PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.severity === "high")) {
            results.push({
                file: "PYTHON_SPARK", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "UX Integrity: Found critical exception reaction patterns.",
                severity: "high", stack: this.stack, evidence: "Structural Analysis", match_count: 1, context: "Event Trigger"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Spark (Python): Auditando reatividade de eventos e latência para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Estratégia de Eventos Python.`;
    }
}
