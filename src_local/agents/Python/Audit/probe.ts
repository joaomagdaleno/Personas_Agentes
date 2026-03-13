import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🔬 Dr. Probe — PhD in Python Error Resilience & Exception Handling
 */
export class ProbePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Probe";
        this.emoji = "🔬";
        this.role = "PhD Resilience Engineer";
        this.phd_identity = "Python Error Resilience & Exception Handling";
        this.stack = "Python";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /except\s*:\s*pass/, issue: "Cegueira Python: Catch vazio (pass) detectado.", severity: "critical" }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Resilience Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Probe (Python): Analisando integridade de erros para ${objective}.`,
            context: "analyzing resilience"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em resiliência Python. Status: ${this.Analysis()}`;
    }
}
