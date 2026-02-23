import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Vault" });

export enum VaultAuditStatusTS {
    COMPLIANT = "COMPLIANT",
    RISKY = "RISKY",
    LEAKING = "LEAKING"
}

export class TSVaultEngine {
    public static audit(content: string): string[] {
        const findings: string[] = [];
        if (content.includes("parseFloat") && /price|amount/i.test(content)) {
            findings.push("Risco de Precisão: parseFloat usado em contexto monetário.");
        }
        return findings;
    }
}

/**
 * 💰 Dr. Vault — PhD in TypeScript Financial Precision & Data Integrity
 * Especialista em precisão monetária, floats para dinheiro e integridade de dados.
 */
export class VaultPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Vault";
        this.emoji = "💰";
        this.role = "PhD Financial Integrity Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Precisão Financeira TypeScript...`);

        const auditRules = [
            { regex: '(?:price|amount|total|cost|fee|tax|balance|salary|revenue)\\s*:\\s*number', issue: 'Risco Financeiro: Campo monetário tipado como "number" — use Decimal/bigint.', severity: 'high' },
            { regex: '(?:price|amount|total|cost)\\s*\\*\\s*(?:price|amount|total|cost|\\d)', issue: 'Imprecisão: Multiplicação de valores monetários com float — erro de centavos.', severity: 'high' },
            { regex: 'parseFloat\\s*\\(.*(?:price|amount|total|cost)', issue: 'Risco: parseFloat para valores monetários perde precisão.', severity: 'high' },
            { regex: 'Math\\.round\\(.*(?:price|amount|total|cost)', issue: 'Gambiarra: Math.round para arredondar dinheiro — use biblioteca de precisão.', severity: 'medium' },
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
        if (/(?:price|amount|total|cost)\s*:\s*number/i.test(content)) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Erro de Precisão: O objetivo '${objective}' exige exatidão. Em '${file}', floats monetários invalidam os cálculos da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Vault: Analisando integridade financeira para ${objective}. Focando em eliminação de ponto flutuante para moeda.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cofre de integridade financeira TS operando com precisão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em integridade financeira e precisão numérica TypeScript.`;
    }
}
