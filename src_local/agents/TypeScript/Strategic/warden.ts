import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Warden" });

/**
 * ⚖️ Dr. Warden — PhD in TypeScript Governance, Ethics & LGPD Compliance
 * Especialista em proteção de dados, rastreamento e conformidade legal.
 */
export class WardenPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Warden";
        this.emoji = "⚖️";
        this.role = "PhD Data Governance & Ethics Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Governança e Ética TypeScript...`);

        const auditRules = [
            { regex: 'localStorage\\.setItem\\(.*(?:user|id|token|email)', issue: 'Risco LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
            { regex: '(?:cpf|rg|ssn|birthDate|nascimento)\\s*[:=]', issue: 'PII Exposta: Dado pessoal sensível manipulado sem criptografia.', severity: 'critical' },
            { regex: 'document\\.cookie\\s*=', issue: 'Rastreamento: Cookie sendo definido — verifique consentimento LGPD.', severity: 'high' },
            { regex: 'navigator\\.(?:geolocation|vibrate|mediaDevices)', issue: 'Permissão Sensível: Acesso a recurso de hardware do usuário.', severity: 'medium' },
            { regex: 'fingerprint|deviceId|machineId', issue: 'Rastreamento Persistente: Identificação de dispositivo sem consentimento.', severity: 'high' },
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
        if (/cpf|rg|ssn|birthDate|nascimento/i.test(content)) {
            return {
                file, severity: "CRITICAL", persona: this.name,
                issue: `Risco Jurídico: O objetivo '${objective}' exige conformidade LGPD. Em '${file}', dados sensíveis sem proteção ameaçam a legitimidade da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da ética e conformidade legal TypeScript.`;
    }
}
