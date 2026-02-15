import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Globe" });

/**
 * 🌍 Dr. Globe — PhD in Bun i18n & Cross-Platform Compatibility
 * Especialista em compatibilidade cross-platform e internacionalização Bun.
 */
export class GlobePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Globe";
        this.emoji = "🌍";
        this.role = "PhD Bun i18n Engineer";
        this.stack = "Bun";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando i18n Bun...`);

        const auditRules = [
            { regex: '(?:message|label|title|text)\\s*[:=]\\s*["\'][A-Z][a-zÀ-ú]', issue: 'Hardcoded: Texto de interface no código Bun.', severity: 'medium' },
            { regex: 'import\\.meta\\.dir', issue: 'Cross-Platform: import.meta.dir é Bun-only — pode quebrar em Node.', severity: 'low' },
            { regex: 'Bun\\.which\\(', issue: 'Cross-Platform: Bun.which() é Bun-only — verifique portabilidade.', severity: 'low' },
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
        if (/import\.meta\.dir|Bun\.which/.test(content)) {
            return {
                file, severity: "LOW", persona: this.name,
                issue: `Portabilidade: O objetivo '${objective}' pode exigir cross-runtime. Em '${file}', APIs Bun-only limitam a portabilidade.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade Bun.`;
    }
}
