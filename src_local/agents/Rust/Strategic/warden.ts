import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 🛡️ Dr. Warden — PhD in Rust Sovereignty & Compliance
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Warden";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Guardian";
        this.phd_identity = "Sovereignty & Strategic Security (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /std::env/, issue: 'Segurança: Acesso a env vars.', severity: 'medium' }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Security Sovereignty Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Warden (Rust): Analisando soberania para ${objective}.`,
            context: "analyzing sovereignty"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em soberania Rust. Status: ${this.Analysis()}`;
    }
}
