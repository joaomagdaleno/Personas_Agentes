import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Forge" });

/**
 * 🔨 Dr. Forge — PhD in Bun Code Safety & Compile-time Security
 * Especialista em segurança de compilação Bun, macros e execução dinâmica.
 */
export class ForgePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Forge";
        this.emoji = "🔨";
        this.role = "PhD Bun Compile Safety Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\beval\s*\(/, issue: 'Crítico: eval() permite execução arbitrária no runtime Bun.', severity: 'critical' },
                { regex: /new\s+Function\s*\(/, issue: 'Risco: new Function() cria código em runtime Bun.', severity: 'critical' },
                { regex: /import\s*\([^)]*\+/, issue: 'Risco: import() dinâmico com concatenação — risco de injeção.', severity: 'high' },
                { regex: /Bun\.build\([^)]*\)(?![\s\S]{0,100}minify)/, issue: 'Otimização: Bun.build() sem minify — bundle pode ser grande.', severity: 'low' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/\beval\s*\(|new\s+Function\s*\(/.test(content)) {
            return {
                file, severity: "CRITICAL",
                issue: `Risco de Autonomia: O objetivo '${objective}' exige segurança de compilação. Em '${file}', execução dinâmica compromete a soberania Bun.`,
                context: "Dynamic execution detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em segurança de compilação e build Bun.`;
    }

    /** Parity: validate_code_safety — Validates if code has dangerous execution patterns. */
    validate_code_safety(content: string, filePath: string): { safe: boolean; issues: string[] } {
        const issues: string[] = [];
        if (/\beval\s*\(/.test(content)) issues.push(`eval() detected in ${filePath}`);
        if (/new\s+Function\s*\(/.test(content)) issues.push(`new Function() detected in ${filePath}`);
        return { safe: issues.length === 0, issues };
    }
}
