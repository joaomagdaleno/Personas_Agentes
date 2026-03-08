import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Vault" });

/**
 * 💰 Dr. Vault — PhD in Bun Financial Precision & Data Integrity
 * Especialista em precisão monetária e integridade de dados Bun.
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "💰";
        this.role = "PhD Bun Financial Integrity Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        this.startMetrics();
        logger.info(`[${this.name}] Analisando Precisão Financeira Bun...`);

        const auditRules = [
            { regex: '(?:price|amount|total|cost|fee)\\s*:\\s*number', issue: 'Risco Financeiro: Campo monetário como "number" no Bun — use BigInt ou Decimal.', severity: 'high' },
            { regex: 'parseFloat\\s*\\(.*(?:price|amount|total)', issue: 'Imprecisão: parseFloat para valores monetários Bun.', severity: 'high' },
            { regex: 'Math\\.round\\(.*(?:price|amount|total)', issue: 'Gambiarra: Math.round para dinheiro no Bun.', severity: 'medium' },
        ];

        const results = await this.findPatterns(['.ts', '.tsx'], auditRules as any);
        this.endMetrics(results.length);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (!/(?:price|amount|total)\s*:\s*number/i.test(content)) return null;

        return {
            file, severity: "HIGH", persona: this.name,
            issue: `Erro de Precisão: O objetivo '${objective}' exige exatidão financeira. Em '${file}', floats monetários invalidam cálculos Bun.`
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integridade financeira Bun.`;
    }
}

