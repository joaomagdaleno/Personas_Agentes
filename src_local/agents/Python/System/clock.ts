import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * ⏰ Clock - PhD in Temporal Integrity & Event Timing (Python Stack)
 * Analisa a integridade de cronogramas, timeouts e sincronia temporal em Python legacy.
 */
export class ClockPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Clock";
        this.emoji = "⏰";
        this.role = "PhD Temporal Engineer";
        this.phd_identity = "Temporal Integrity & Event Timing (Python)";
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
                { regex: /datetime\.now\(\)/, issue: "Tempo Local: Use datetime.now(datetime.UTC) para integridade temporal PhD em sistemas distribuídos.", severity: "medium" },
                { regex: /time\.time\(\)/, issue: "Precisão Temporal: Verifique precisão de ponto flutuante para medições PhD.", severity: "low" },
                { regex: /sched\.scheduler|threading\.Timer/, issue: "Agenciamento Temporal: Verifique drift e cancelamento do scheduler PhD.", severity: "medium" },
                { regex: /while True:.*time\.sleep\(.*\)/, issue: "Loop de Intervalo: Verifique se sleep causa latência indesejada PhD.", severity: "low" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        if (results.some(r => r.issue.includes("datetime.now()"))) {
            results.push({
                file: "TEMPORAL_SOVEREIGNTY", agent: this.name, role: this.role, emoji: this.emoji,
                issue: "Temporal Sovereignty: Found non-UTC time generation in Python layer.",
                severity: "medium", stack: this.stack, evidence: "Timezone Audit", match_count: 1, context: "Temporal Sync"
            } as any);
        }

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Clock (Python): Auditando precisão de timing e sincronia de eventos legacy para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Engenharia Temporal Python.`;
    }
}
