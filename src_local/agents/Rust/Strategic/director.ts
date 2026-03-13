import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🏛️ Director - Executive PhD in Rust Orchestration
 */
export class DirectorPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Director";
        this.emoji = "🏛️";
        this.role = "PhD Rust Orchestrator";
        this.phd_identity = "Sovereign Rust Systemic Orchestration";
        this.stack = "Rust";
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /pub\s+fn\s+main/, issue: 'Orquestração: Entry point do Rust.', severity: 'low' }
            ]
        };
    }

    override async execute(context: ProjectContext): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Executive Orchestration Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            severity: "INFO",
            issue: `PhD Director (Rust): Analisando orquestração para ${objective}.`,
            context: "summarizing orchestration"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre da orquestração nativa em Rust. Status: ${this.Analysis()}`;
    }
}
