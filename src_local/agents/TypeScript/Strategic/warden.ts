import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Warden — PhD in TypeScript Sovereignty & Security
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Guardian";
        this.phd_identity = "Sovereignty & Strategic Security (TypeScript)";
        this.stack = "TypeScript";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const results: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return results;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.mjs', '.cjs'],
            rules: [
                { regex: /process\.env/, issue: 'Segurança: Acesso a variáveis de ambiente; verifique segredos PhD.', severity: 'medium' }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);
        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file, severity: "STRATEGIC",
            issue: `PhD Warden (TypeScript): Analisando soberania para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em soberania estratégica TypeScript.`;
    }
}
