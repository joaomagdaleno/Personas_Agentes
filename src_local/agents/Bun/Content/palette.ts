import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Palette" });

/**
 * 🎨 Dr. Palette — PhD in Bun Frontend & Design Consistency
 * Especialista em consistência visual no ecossistema Bun.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD Bun UX & Design Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.css'],
            rules: [
                { regex: /color:\s*["']#[0-9a-fA-F]{3,8}["']/, issue: 'Fragmentação: Cor hardcoded — use design tokens.', severity: 'medium' },
                { regex: /style\s*=\s*\{\{/, issue: 'Inline Style: Estilo inline em componente Bun.', severity: 'medium' },
                { regex: /(?:width|height|margin|padding):\s*\d{2,}/, issue: 'Magic Number: Dimensão hardcoded em componente Bun.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/style\s*=\s*\{\{/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', inline styles impedem a evolução visual do projeto Bun.`,
                context: "Inline styles detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em design systems e consistência visual Bun.`;
    }
}
