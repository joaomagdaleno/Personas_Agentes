import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Palette" });

/**
 * 🎨 Dr. Palette — PhD in TypeScript UX Quality & Visual Consistency
 * Especialista em consistência visual, magic numbers e hardcoded styles.
 */
export class PalettePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Palette";
        this.emoji = "🎨";
        this.role = "PhD UX & Design Systems Engineer";
        this.stack = "TypeScript";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx', '.css'],
            rules: [
                { regex: /color:\s*["']#[0-9a-fA-F]{3,8}["']/, issue: 'Fragmentação Visual: Cor hardcoded — use design tokens.', severity: 'medium' },
                { regex: /style\s*=\s*\{\{/, issue: 'Inline Style: Estilo inline dificulta manutenção e consistência.', severity: 'medium' },
                { regex: /(?:width|height|margin|padding):\s*\d{2,}/, issue: 'Magic Number: Dimensão hardcoded — use variáveis de design system.', severity: 'low' },
                { regex: /font-size:\s*\d+px/, issue: 'Tipografia Rígida: font-size em pixels sem escala responsiva.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/color:\s*['"]#/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Fragmentação Visual: O objetivo '${objective}' exige consistência. Em '${file}', cores hardcoded impedem que a 'Orquestração de Inteligência Artificial' mantenha identidade visual.`,
                context: "Hardcoded colors detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Palette: Analisando consistência visual para ${objective}. Focando em design tokens e eliminação de estilos inline.`,
            context: "analyzing visual consistency"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Curador de consistência visual TS operando com estética PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em sistemas de design e consistência visual TypeScript.`;
    }
}
