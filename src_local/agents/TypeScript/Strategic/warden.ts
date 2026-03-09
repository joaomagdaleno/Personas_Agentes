import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /localStorage\.setItem\(.*(?:user|id|token|email)/i, issue: 'Risco LGPD: Dados pessoais em localStorage sem consentimento.', severity: 'high' },
                { regex: /(?:cpf|rg|ssn|birthDate|nascimento)\s*[:=]/i, issue: 'PII Exposta: Dado pessoal sensível manipulado sem criptografia.', severity: 'critical' },
                { regex: /document\.cookie\s*=/i, issue: 'Rastreamento: Cookie sendo definido — verifique consentimento LGPD.', severity: 'high' },
                { regex: /navigator\.(?:geolocation|vibrate|mediaDevices)/i, issue: 'Permissão Sensível: Acesso a recurso de hardware do usuário.', severity: 'medium' },
                { regex: /fingerprint|deviceId|machineId/i, issue: 'Rastreamento Persistente: Identificação de dispositivo sem consentimento.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/cpf|rg|ssn|birthDate|nascimento/i.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco Jurídico: O objetivo '${objective}' exige conformidade LGPD. Em '${file}', dados sensíveis sem proteção ameaçam a legitimidade da 'Orquestração de Inteligência Artificial'.`,
                context: "PII detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Warden: Analisando ética de dados para ${objective}. Focando em privacidade e conformidade LGPD.`,
            context: "analyzing governance"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Juiz de ética e governança TS operando com lei PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, guardião da ética e conformidade legal TypeScript.`;
    }
}
