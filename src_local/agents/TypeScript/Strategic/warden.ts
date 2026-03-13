import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🛡️ Dr. Warden — PhD in TypeScript Sovereignty & Security
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Warden";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Guardian";
        this.phd_identity = "Sovereignty & Strategic Security (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /process\.env/, issue: 'Segurança: Acesso a variáveis de ambiente; verifique segredos.', severity: 'medium' }
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
            issue: `PhD Warden (TypeScript): Analisando soberania para ${objective}.`,
            context: "analyzing sovereignty"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em soberania estratégica TypeScript. Status: ${this.Analysis()}`;
    }
}
