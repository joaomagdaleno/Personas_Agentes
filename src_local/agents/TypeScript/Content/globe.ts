import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Globe" });

/**
 * 🌍 Dr. Globe — PhD in TypeScript Internationalization & Localization
 * Especialista em portabilidade global, hardcoded strings e encoding.
 */
export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Internationalization Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /readFile[^(]*\([^)]*(?!utf|encoding)[^)]*\)/, issue: 'Risco i18n: Leitura de arquivo sem especificar encoding UTF-8.', severity: 'medium' },
                { regex: /(?:message|label|title|text|placeholder)\s*[:=]\s*["'][A-Z][a-zÀ-ú]/, issue: 'Hardcoded String: Texto de interface diretamente no código — impede tradução.', severity: 'medium' },
                { regex: /new\s+Date\(\)\.toLocaleDateString\(\)/, issue: 'Locale Implícito: toLocaleDateString() sem locale explícito.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/(?:message|label|title)\s*[:=]\s*['"][A-Z]/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Risco de Localização: O objetivo '${objective}' exige portabilidade global. Em '${file}', strings hardcoded impedem a internacionalização da 'Orquestração de Inteligência Artificial'.`,
                context: "Hardcoded strings detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD I18n: Analisando portabilidade para ${objective}. Focando em encoding e externalização de strings.`,
            context: "analyzing portability"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Auditor de internacionalização TS operando com consciência PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade TypeScript.`;
    }
}
