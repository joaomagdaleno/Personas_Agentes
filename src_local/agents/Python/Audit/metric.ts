import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Python)
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.phd_identity = "Python Data Telemetry & Logging";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /print\(/, issue: "Cegueira: Saída não gerenciada via print detectada.", severity: "high" }
            ]
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file, severity: "INFO",
            issue: `PhD Metric: Analisando telemetria para ${objective}.`,
            context: "analyzing metrics"
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em telemetria Python.`;
    }
}
