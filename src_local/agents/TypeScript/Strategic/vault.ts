import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:price|amount|total|cost|fee|tax|balance|salary|revenue)\s*:\s*number/i, issue: 'Risco Financeiro: Campo monetário tipado como "number" — use Decimal/bigint.', severity: 'high' },
                { regex: /(?:price|amount|total|cost)\s*\*\s*(?:price|amount|total|cost|\d)/i, issue: 'Imprecisão: Multiplicação de valores monetários com float — erro de centavos.', severity: 'high' },
                { regex: /parseFloat\s*\(.*(?:price|amount|total|cost)/i, issue: 'Risco: parseFloat para valores monetários perde precisão.', severity: 'high' },
                { regex: /Math\.round\(.*(?:price|amount|total|cost)/i, issue: 'Gambiarra: Math.round para arredondar dinheiro — use biblioteca de precisão.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/(?:price|amount|total|cost)\s*:\s*number/i.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Erro de Precisão: O objetivo '${objective}' exige exatidão. Em '${file}', floats monetários invalidam os cálculos da 'Orquestração de Inteligência Artificial'.`,
                context: "monetary number type detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Vault: Analisando integridade financeira para ${objective}. Focando em eliminação de ponto flutuante para moeda.`,
            context: "analyzing financial integrity"
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
