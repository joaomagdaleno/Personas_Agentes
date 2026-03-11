import { BaseActivePersona } from "../../base.ts";
import type { AuditRule, StrategicFinding, AuditFinding } from "../../base.ts";
import type { ProjectContext } from "../../../core/types.ts";

/**
 * 💰 Dr. Vault — PhD in Bun Financial Precision & Data Integrity
 * Especialista em precisão monetária e integridade de dados Bun.
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot: string | undefined = undefined) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "💰";
        this.role = "PhD Cryptographer";
        this.phd_identity = "Bun Financial Precision & Data Integrity";
        this.stack = "Bun";
    }

    override async execute(context: ProjectContext): Promise<AuditFinding[]> {
        this.setContext(context);
        const findings = await this.performAudit();

        if (this.hub) {
            // Financial Intelligence via Knowledge Graph
            const currencyQuery = await this.hub.queryKnowledgeGraph("Currency", "high");
            
            // PhD Financial Reasoning
            const reasoning = await this.hub.reason(`Analyze the financial precision and floating-point risks of a Bun system with ${currencyQuery.length} currency-related patterns.`);

            findings.push({
                file: "Financial Core", agent: this.name, role: this.role, emoji: this.emoji,
                issue: `Sovereign Vault: Integridade financeira Bun validada via Rust Hub. PhD Analysis: ${reasoning}`,
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Monetary Audit", match_count: 1
            } as any);
        }
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:price|amount|total|cost|fee)\s*:\s*number/, issue: 'Risco Financeiro: Campo monetário como "number" no Bun — use BigInt ou Decimal.', severity: 'high' },
                { regex: /parseFloat\s*\(.*(?:price|amount|total)/, issue: 'Imprecisão: parseFloat para valores monetários Bun.', severity: 'high' },
                { regex: /Math\.round\(.*(?:price|amount|total)/, issue: 'Gambiarra: Math.round para dinheiro no Bun.', severity: 'medium' },
            ]
        };
    }

    override reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (!/(?:price|amount|total)\s*:\s*number/i.test(content)) return null;

        return {
            file, severity: "HIGH",
            issue: `Erro de Precisão: O objetivo '${objective}' exige exatidão financeira. Em '${file}', floats monetários invalidam cálculos Bun.`,
            context: "monetary number type detected"
        };
    }

    override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integridade financeira Bun.`;
    }
}

