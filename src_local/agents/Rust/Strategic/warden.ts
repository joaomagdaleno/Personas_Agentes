import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🛡️ Dr. Warden — PhD in Rust Sovereignty & Compliance
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "🛡️";
        this.role = "PhD Strategic Guardian";
        this.phd_identity = "Sovereignty & Strategic Security (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /std::env/, issue: 'Segurança: Acesso a variáveis de ambiente nativas. Evite vazamentos de segredos PhD.', severity: 'medium' },
                { regex: /Command::new/, issue: 'Soberania: Execução de processo subprocess nativo detectada. Risco de Command Injection PhD.', severity: 'high' }
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
            issue: `PhD Warden (Rust): Analisando soberania existencial para ${objective}. Garantindo governança FFI PhD.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em soberania e segurança estratégica Rust.`;
    }
}
