import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /(?:message|label|title|text)\s*[:=]\s*["'][A-Z][a-zÀ-ú]/, issue: 'Hardcoded: Texto de interface no código Bun.', severity: 'medium' },
                { regex: /import\.meta\.dir/, issue: 'Cross-Platform: import.meta.dir é Bun-only — pode quebrar em Node.', severity: 'low' },
                { regex: /Bun\.which\(/, issue: 'Cross-Platform: Bun.which() é Bun-only — verifique portabilidade.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/import\.meta\.dir|Bun\.which/.test(content)) {
            return {
                file, severity: "LOW",
                issue: `Portabilidade: O objetivo '${objective}' pode exigir cross-runtime. Em '${file}', APIs Bun-only limitam a portabilidade.`,
                context: "Bun-only API detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em internacionalização e portabilidade Bun.`;
    }
}
