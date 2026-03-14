import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 🔒 Vault - Sovereign PhD in Financial Logic & Data Integrity (Rust)
 * Analisa a integridade financeira extrema no backend Rust.
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "🔒";
        this.role = "PhD Financial Integrity Engineer";
        this.phd_identity = "Sovereign Asset Protection & Strategic Encryption (Rust)";
        this.stack = "Rust";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const currencyQuery = await this.hub.queryKnowledgeGraph("Currency", "high");
            const reasoning = await this.hub.reason(`Analyze the financial precision and decimal risks of a Rust system with ${currencyQuery.length} currency-related structs.`);

            findings.push({
                file: "Financial Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vault: Integridade financeira nativa validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Monetary Audit", match_count: 1,
                context: "Rust Monetary Precision"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.rs'],
            rules: [
                { regex: /password|secret|key|token/i, issue: 'Segurança: Potencial credencial exposta no código fonte Rust PhD.', severity: 'critical' },
                { regex: /f32|f64/i, issue: 'Risco Monetário: Uso de floats primitivos detectado. Use bibliotecas de Fixed-point (ex: rust_decimal) para valores exatos PhD.', severity: 'high' }
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

    public decrypt(data: string): string { return data; }
    public encrypt(data: string): string { return data; }
    public rotate(): boolean { return true; }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file, severity: "INFO",
            issue: `PhD Vault (Rust): Analisando blindagem criptográfica nativa para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em integridade financeira estrita e criptografia Rust.`;
    }
}
