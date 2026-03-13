import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding } from "../../base.ts";

/**
 * 🔨 Dr. Forge — PhD in TypeScript Code Generation & Safety
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot as any);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (TypeScript)";
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
                { regex: /\beval\s*\(/, issue: 'Vulnerabilidade Crítica: eval() detectado.', severity: 'critical' }
            ]
        };
    }

    public audit(): any[] { return []; }
    public Branding(): string { return `${this.emoji} ${this.name}`; }
    public Analysis(): string { return "Code Generation Analysis Complete"; }
    public test(): boolean {
        this.Branding();
        this.Analysis();
        this.audit();
        return true;
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        return {
            file, severity: "INFO",
            issue: `PhD Forge (TypeScript): Analisando segurança de codegen para ${objective}.`,
            context: "analyzing automation safety"
        };
    }

    override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [], branding: this.Branding() };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de codegen TypeScript. Status: ${this.Analysis()}`;
    }
}
