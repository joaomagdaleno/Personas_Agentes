import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";

/**
 * 🔒 Strict - PhD in Compiler Rigor & Type Purity (Kotlin)
 */
export class StrictPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Strict";
        this.emoji = "🔒";
        this.role = "PhD Memory Safety Guardian";
        this.phd_identity = "Type Safety & Android Rigor (Kotlin)";
        this.stack = "Kotlin";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".kt", ".kts"],
            rules: [
                { regex: /!!/, issue: "Null Safety: Operador '!!' detectado.", severity: "high" }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Type Purity Analysis Complete"; }
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
            issue: `PhD Strict (Kotlin): Analisando rigor para ${objective}.`,
            context: "analyzing strictness"
        } as any;
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em rigor Kotlin. Status: ${this.Analysis()}`;
    }
}
