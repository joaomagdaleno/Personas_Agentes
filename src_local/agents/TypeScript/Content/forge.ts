import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🔨 Dr. Forge — PhD in TypeScript Code Generation & Safety
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Automation & Safety Engineer";
        this.phd_identity = "Code Generation & Dynamic Execution Safety (TypeScript)";
        this.stack = "TypeScript";
    }

    override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
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

    public Branding(): string { return `${this.emoji} ${this.name}`; }

    override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | string | null {
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
        return `Você é o Dr. ${this.name}, mestre em segurança de codegen TypeScript. Status: Code Generation Analysis Ready`;
    }
}
