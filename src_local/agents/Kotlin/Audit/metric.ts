import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 📊 Metric - PhD in Statistics & System Instrumentation (Kotlin)
 */
export class MetricPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Metric";
        this.emoji = "📊";
        this.role = "PhD Telemetry Engineer";
        this.phd_identity = "Kotlin Data Telemetry & Logging";
        this.stack = "Kotlin";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /System\.out\.println|Log\.[di]\(/, issue: "Cegueira: Saída não gerenciada.", severity: "high" }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Metric Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): string | StrategicFinding | null {
        return {
            file, severity: "INFO",
            issue: `PhD Metric (Kotlin): Analisando telemetria para ${objective}.`,
            context: "analyzing metrics"
        } as StrategicFinding;
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em telemetria Kotlin. Status: ${this.Analysis()}`;
    }
}
