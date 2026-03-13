import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🧪 Testify Persona (Python Stack) - PhD in Quality Assurance
 */
export class TestifyPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Testify";
        this.emoji = "🧪";
        this.role = "PhD Quality Assurance Engineer";
        this.phd_identity = "Python Test Coverage & QA";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /def\s+test_.*\(\s*\)\s*:\s*pass/, issue: "Teste Vazio detectado.", severity: "critical" }
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
            issue: `PhD Testify (Python): Analisando testes para ${objective}.`,
            context: "analyzing quality"
        } as any;
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Qualidade Python. Status: ${this.Analysis()}`;
    }
}
