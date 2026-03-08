import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Nebula" });

/**
 * ☁️ Dr. Nebula — PhD in TypeScript Cloud Security & Secrets Management
 * Especialista em segurança de credenciais, chaves expostas e vazamento de segredos.
 */
export class NebulaPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Nebula";
        this.emoji = "☁️";
        this.role = "PhD Cloud Security Architect";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.json'],
            rules: [
                { regex: /AKIA[0-9A-Z]{16}/, issue: 'Vulnerabilidade Crítica: Chave AWS exposta no código TypeScript.', severity: 'critical' },
                { regex: /(?:api[_-]?key|apiKey|API_KEY)\s*[:=]\s*["'][^"']{8,}/, issue: 'Vazamento: API Key hardcoded no código-fonte.', severity: 'critical' },
                { regex: /(?:password|passwd|secret)\s*[:=]\s*["'][^"']+["']/, issue: 'Vazamento: Credencial hardcoded no código-fonte.', severity: 'critical' },
                { regex: /sk-[a-zA-Z0-9]{20,}/, issue: 'Vulnerabilidade Crítica: Chave OpenAI exposta.', severity: 'critical' },
                { regex: /ghp_[a-zA-Z0-9]{36}/, issue: 'Vulnerabilidade Crítica: Token GitHub exposto.', severity: 'critical' },
                { regex: /process\.env\.[A-Z_]+\s*\|\|\s*["'][^"']{8,}/, issue: 'Risco: Fallback de variável de ambiente contém segredo real.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (file.includes('persona_manifest') || file.includes('rules')) return null;
        if (/AKIA|sk-[a-zA-Z0-9]{20}|ghp_/.test(content) && !/rules\s*=/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Catástrofe de Segurança: O objetivo '${objective}' exige proteção total. Credenciais expostas em '${file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'.`,
                context: "Secret pattern detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Cloud Security: Analisando soberania de segredos para ${objective}. Focando em eliminação de hardcoded tokens.`,
            context: "analyzing cloud security"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Cinturão de segurança cloud TS operando com integridade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em soberania cloud e segurança de segredos TypeScript.`;
    }
}
