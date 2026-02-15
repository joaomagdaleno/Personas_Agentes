import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Internacionalização TypeScript...`);

        const auditRules = [
            { regex: 'readFile[^(]*\\([^)]*(?!utf|encoding)[^)]*\\)', issue: 'Risco i18n: Leitura de arquivo sem especificar encoding UTF-8.', severity: 'medium' },
            { regex: '(?:message|label|title|text|placeholder)\\s*[:=]\\s*["\'][A-Z][a-zÀ-ú]', issue: 'Hardcoded String: Texto de interface diretamente no código — impede tradução.', severity: 'medium' },
            { regex: 'new\\s+Date\\(\\)\\.toLocaleDateString\\(\\)', issue: 'Locale Implícito: toLocaleDateString() sem locale explícito.', severity: 'low' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
            for (const [filePath, content] of Object.entries(this.contextData)) {
                if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                    for (const match of (content as string).matchAll(regex)) {
                        results.push({ file: filePath, issue: rule.issue, severity: rule.severity, evidence: match[0].substring(0, 60), persona: this.name });
                    }
                }
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        if (/(?:message|label|title)\s*[:=]\s*['"][A-Z]/.test(content)) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Risco de Localização: O objetivo '${objective}' exige portabilidade global. Em '${file}', strings hardcoded impedem a internacionalização da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade TypeScript.`;
    }
}
