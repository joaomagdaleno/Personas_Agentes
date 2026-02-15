import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Governança Bun...`);

        const auditRules = [
            { regex: '(?:cpf|rg|ssn|birthDate|nascimento)\\s*[:=]', issue: 'PII: Dado pessoal sensível no Bun sem criptografia.', severity: 'critical' },
            { regex: 'localStorage\\.setItem\\(.*(?:user|email|token)', issue: 'LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
            { regex: 'document\\.cookie\\s*=', issue: 'Rastreamento: Cookie sendo definido no Bun.', severity: 'high' },
            { regex: 'Bun\\.file\\([^)]*\\).*(?:cpf|rg|password|ssn)', issue: 'PII em Disco: Bun.file lendo/gravando dados sensíveis.', severity: 'critical' },
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
        if (/cpf|rg|ssn|nascimento/i.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Risco LGPD: O objetivo '${objective}' exige conformidade. Em '${file}', PII sem proteção viola a legislação no ambiente Bun.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da governança e ética de dados Bun.`;
    }
}
