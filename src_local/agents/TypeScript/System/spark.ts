import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
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

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /process\.exit\(\d+\)(?![\s\S]{0,30}console|log|error)/, issue: 'Saída Silenciosa: process.exit() sem mensagem — dev não sabe o que aconteceu.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']["']\)/, issue: 'Erro Mudo: Error lançado com mensagem vazia.', severity: 'medium' },
                { regex: /\.on\(["']error["']\s*,\s*\(\)\s*=>\s*\{\s*\}\)/, issue: 'Erro Invisível: Event handler de erro vazio — falha silenciosa.', severity: 'high' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/process\.exit\(\d+\)/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `Interface Árida: O objetivo '${objective}' exige percepção premium. Em '${file}', saídas silenciosas prejudicam a DX da 'Orquestração de Inteligência Artificial'.`,
                context: "process.exit detected"
            };
        }
        return {
            file, severity: "INFO",
            issue: `PhD Spark: Analisando Developer Experience para ${objective}. Focando em mensagens de erro claras e feedback visual.`,
            context: "analyzing DX"
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Designer de experiência TS operando com empatia PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em engajamento e experiência do desenvolvedor TypeScript.`;
    }
}
