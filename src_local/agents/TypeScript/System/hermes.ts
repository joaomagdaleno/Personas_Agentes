import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Hermes" });

/**
 * ⚙️ Dr. Hermes — PhD in TypeScript DevOps, CI/CD & Environment Safety
 * Especialista em segurança de ambiente, flags de debug e configuração de produção.
 */
export class HermesPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Hermes";
        this.emoji = "⚙️";
        this.role = "PhD DevOps & SRE Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /DEBUG\s*=\s*true/, issue: 'Ambiente: Flag DEBUG ativa — risco em produção.', severity: 'high' },
                { regex: /NODE_ENV\s*[!=]==?\s*["']development/, issue: 'Condicional de Ambiente: Lógica bifurcada por NODE_ENV — verifique segurança.', severity: 'medium' },
                { regex: /process\.env\.[A-Z_]+(?!\s*\?)(?!.*\|\|)(?!.*[\?][\?])(?!.*throw)/, issue: 'Variável Frágil: process.env sem fallback ou validação.', severity: 'medium' },
                { regex: /dotenv\.config\(\)/, issue: 'Risco: dotenv carregando .env — garanta que .env não está no Git.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/DEBUG\s*=\s*true/i.test(content)) {
            return {
                file, severity: "HIGH",
                issue: `Risco de Integridade: O objetivo '${objective}' exige artefatos verificados. Em '${file}', flags de debug em produção expõem a 'Orquestração de Inteligência Artificial'.`,
                context: "DEBUG=true detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Hermes: Analisando estabilidade de ambiente para ${objective}. Focando em configuração segura e reprodutibilidade.`,
            context: "analyzing environment stability"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Engenheiro SRE TS operando com confiabilidade PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DevOps e SRE TypeScript.`;
    }
}
