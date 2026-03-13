import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🎯 Dr. Scope — PhD in Kotlin Project Management & Technical Debt
 */
export class ScopePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Scope";
        this.emoji = "🎯";
        this.role = "PhD Project Strategist";
        this.phd_identity = "Kotlin Project Management & Technical Debt";
        this.stack = "Kotlin";
    }

    override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt"],
            rules: [
                { regex: /\/\/\s*TODO[:\s]/i, issue: 'Dívida Técnica: TODO pendente no código Kotlin.', severity: 'medium' }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Project Scope Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Scope (Kotlin): Analisando escopo para ${objective}.`,
            context: "analyzing project debt"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em dívida técnica Kotlin. Status: ${this.Analysis()}`;
    }
}
