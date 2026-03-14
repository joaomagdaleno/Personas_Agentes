import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🎯 Dr. Scope — PhD in Python Project Management & Technical Debt
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Project Strategist";
        this.phd_identity = "Python Project Management & Technical Debt";
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
                { regex: /#\s*TODO[:\s]/i, issue: 'Dívida Técnica: TODO pendente no código Python.', severity: 'medium' }
            ]
        };
    }

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Scope (Python): Analisando escopo para ${objective}.`,
            context: "analyzing project debt"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em dívida técnica Python.`;
    }
}
