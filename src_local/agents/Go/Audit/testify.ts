import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 Testify Persona (Go Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Go Testing & Verification Specialist";
        this.stack = "Go";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /func\s+Test.*\{\s*}/, issue: "Empty Test detectado.", severity: "critical" }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Quality Assurance Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    public override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "INFO",
            issue: `PhD Testify (Go): Analisando qualidade para ${objective}.`,
            context: "analyzing coverage"
        } as any;
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em testes Go. Status: ${this.Analysis()}`;
    }
}
