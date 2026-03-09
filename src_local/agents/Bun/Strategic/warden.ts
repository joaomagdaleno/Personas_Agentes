import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Warden" });

/**
 * ⚖️ Dr. Warden — PhD in Bun Data Governance & LGPD Compliance
 * Especialista em proteção de dados, rastreamento e conformidade legal Bun.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Bun Data Governance Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:cpf|rg|ssn|birthDate|nascimento)\s*[:=]/i, issue: 'PII: Dado pessoal sensível no Bun sem criptografia.', severity: 'critical' },
                { regex: /localStorage\.setItem\(.*(?:user|email|token)/, issue: 'LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
                { regex: /document\.cookie\s*=/, issue: 'Rastreamento: Cookie sendo definido no Bun.', severity: 'high' },
                { regex: /Bun\.file\([^)]*\).*(?:cpf|rg|password|ssn)/i, issue: 'PII em Disco: Bun.file lendo/gravando dados sensíveis.', severity: 'critical' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (!/cpf|rg|ssn|nascimento/i.test(content)) return null;

        return {
            file, severity: "CRITICAL",
            issue: `Risco LGPD: O objetivo '${objective}' exige conformidade. Em '${file}', PII sem proteção viola a legislação no ambiente Bun.`,
            context: "PII pattern detected"
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da governança e ética de dados Bun.`;
    }
}

