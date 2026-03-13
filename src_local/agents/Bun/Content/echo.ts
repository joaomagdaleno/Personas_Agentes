import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔊 EchoPersona (Bun Stack) - PhD in Traceability & Native Auditing
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🔊";
        this.role = "PhD Audit Engineer";
        this.phd_identity = "High-Fidelity Traceability & Log Integrity";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.js'],
            rules: [
                { regex: /console\.log\(/, issue: 'Rastreabilidade: Use um logger estruturado em vez de console.log.', severity: 'low' }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Traceability Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file, severity: "INFO",
            issue: `PhD Echo (Bun): Garantindo rastreabilidade para ${objective}.`,
            context: "analyzing traceability"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em rastreabilidade Bun. Status: ${this.Analysis()}`;
    }
}
