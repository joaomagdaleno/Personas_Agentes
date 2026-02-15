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
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Precisão Financeira Bun...`);

        const auditRules = [
            { regex: '(?:price|amount|total|cost|fee)\\s*:\\s*number', issue: 'Risco Financeiro: Campo monetário como "number" no Bun — use BigInt ou Decimal.', severity: 'high' },
            { regex: 'parseFloat\\s*\\(.*(?:price|amount|total)', issue: 'Imprecisão: parseFloat para valores monetários Bun.', severity: 'high' },
            { regex: 'Math\\.round\\(.*(?:price|amount|total)', issue: 'Gambiarra: Math.round para dinheiro no Bun.', severity: 'medium' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'gi');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0], persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/(?:price|amount|total)\s*:\s*number/i.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Erro de Precisão: O objetivo '${objective}' exige exatidão financeira. Em '${file}', floats monetários invalidam cálculos Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integridade financeira Bun.`;
    }
}
