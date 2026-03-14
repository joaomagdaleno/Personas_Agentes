import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🔊 EchoPersona (TypeScript Stack) - PhD in Traceability & Native Auditing
 */
export class EchoPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Echo";
        this.emoji = "🔊";
        this.role = "PhD Audit Engineer";
        this.phd_identity = "High-Fidelity Traceability & Log Integrity";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /console\.log\(/, issue: 'Rastreabilidade: Use um logger estruturado.', severity: 'low' }
            ]
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file, severity: "INFO",
            issue: `PhD Echo (TypeScript): Garantindo rastreabilidade para ${objective}.`,
            context: "analyzing traceability"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em rastreabilidade TypeScript. Status: Traceability Analysis Ready`;
    }
}
