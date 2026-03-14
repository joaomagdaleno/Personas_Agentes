import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding, ProjectContext } from "../../base.ts";

/**
 * 🔒 VaultPersona (Python Stack) - Sovereign PhD in Financial Logic & Data Integrity
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "🔒";
        this.role = "PhD Financial Integrity Engineer";
        this.phd_identity = "Sovereign Asset Protection & Strategic Encryption";
        this.stack = "Python";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".py"],
            rules: [
                { regex: /password|secret|key|token/i, issue: "Segurança: Potencial credencial exposta detectada em Python PhD.", severity: "critical" },
                { regex: /hashlib\.md5|hashlib\.sha1/, issue: "Weak Hashing: Hash fraco detectado PhD.", severity: "high" }
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
            issue: `PhD Vault (Python): Garantindo integridade financeira e criptografia para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em integridade financeira e criptográfica Python.`;
    }
}
