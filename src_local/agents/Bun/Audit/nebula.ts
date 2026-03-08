import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Nebula" });

/**
 * ☁️ Dr. Nebula — PhD in Bun Security & Secrets Management
 * Especialista em Bun.password, segurança de hashing e proteção de credenciais.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Bun Security Architect";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.json'],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código Bun.', severity: 'critical' },
                { regex: /sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}/, issue: 'Vulnerabilidade Crítica: Token (OpenAI/GitHub) exposto.', severity: 'critical' },
                { regex: /(?:apiKey|API_KEY|password|secret)\s*[:=]\s*["'][^"']{8,}/, issue: 'Vazamento: Credencial hardcoded no código-fonte Bun.', severity: 'critical' },
                { regex: /bcrypt|crypto\.createHash/, issue: 'Polyfill: Use Bun.password.hash() nativo para soberania de hashing.', severity: 'medium' },
                { regex: /Bun\.env\.[A-Z_]+(?!.*\?\?|.*\|\||.*throw)/, issue: 'Frágil: Acesso direto a Bun.env sem fallback de segurança.', severity: 'high' },
                { regex: /(?:process\.env|Bun\.env)\.[A-Z_]+\s*\|\|\s*["'][^"']{8,}/, issue: 'Risco: Fallback de variável de ambiente contém segredo real.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.includes('persona_manifest')) return null;

        if (/AKIA|sk-[a-zA-Z0-9]{20}|ghp_/.test(content) && !/rules\s*=/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'.`,
                context: "sensitive credential pattern detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança e proteção de segredos Bun.`;
    }
}
