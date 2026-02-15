import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Spark" });

/**
 * ✨ Dr. Spark — PhD in TypeScript Developer Experience & CLI Engagement
 * Especialista em UX de ferramentas, feedback visual e experiência do desenvolvedor.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Developer Experience Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando DX TypeScript...`);

        const auditRules = [
            { regex: 'process\\.exit\\(\\d+\\)(?![\\s\\S]{0,30}console|log|error)', issue: 'Saída Silenciosa: process.exit() sem mensagem — dev não sabe o que aconteceu.', severity: 'medium' },
            { regex: 'throw\\s+new\\s+Error\\(["\']["\']\\)', issue: 'Erro Mudo: Error lançado com mensagem vazia.', severity: 'medium' },
            { regex: '\\.on\\(["\']error["\']\\s*,\\s*\\(\\)\\s*=>\\s*\\{\\s*\\}\\)', issue: 'Erro Invisível: Event handler de erro vazio — falha silenciosa.', severity: 'high' },
        ];

        const results: any[] = [];
        for (const rule of auditRules) {
            const regex = new RegExp(rule.regex, 'g');
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
        if (/process\.exit\(\d+\)/.test(content) && !/console|log|error/.test(content.slice(content.indexOf('process.exit'), content.indexOf('process.exit') + 60))) {
            return {
                file, severity: "MEDIUM", persona: this.name,
                issue: `Interface Árida: O objetivo '${objective}' exige percepção premium. Em '${file}', saídas silenciosas prejudicam a DX da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em engajamento e experiência do desenvolvedor TypeScript.`;
    }
}
