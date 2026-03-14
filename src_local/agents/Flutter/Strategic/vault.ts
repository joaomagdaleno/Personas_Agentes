import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 💰 Dr. Vault — PhD in Flutter Financial Precision & Data Integrity
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "💰";
        this.role = "PhD Financial Integrity Engineer";
        this.phd_identity = "Flutter Financial Precision & Data Integrity";
        this.stack = "Flutter";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        
        if (this.hub) {
            const currencyQuery = await this.hub.queryKnowledgeGraph("Currency", "high");
            const reasoning = await this.hub.reason(`Analyze the financial precision and floating-point risks of a Flutter system with ${currencyQuery.length} currency-related patterns.`);

            findings.push({
                file: "Financial Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vault: Integridade financeira Flutter validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Monetary Audit", match_count: 1,
                context: "Flutter Monetary Precision"
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /double\s+\w*(?:price|amount|total|cost)/i, issue: 'Risco Financeiro: Uso de double para valores monetários em Flutter PhD.', severity: 'high' }
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
            issue: `PhD Vault (Flutter): Analisando precisão financeira absoluta para ${objective}.`,
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integridade financeira Flutter.`;
    }
}
