import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Spark" });

/**
 * ✨ Dr. Spark — PhD in Bun Developer Experience & CLI Quality
 * Especialista em DX Bun, feedback visual e experiência de CLI.
 */
export class SparkPersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Spark";
        this.emoji = "✨";
        this.role = "PhD Bun Developer Experience Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /process\.exit\(\d+\)(?![\s\S]{0,30}console|log)/, issue: 'Saída Silenciosa: process.exit() sem mensagem no Bun.', severity: 'medium' },
                { regex: /throw\s+new\s+Error\(["']["']\)/, issue: 'Erro Mudo: Error lançado com mensagem vazia no Bun.', severity: 'medium' },
                { regex: /Bun\.spawn\(\[[^\]]*\]\)(?![\s\S]{0,50}stdout|stderr)/, issue: 'Spawn Cego: Bun.spawn sem captura de stdout/stderr.', severity: 'medium' },
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        if (/process\.exit\(\d+\)/.test(content)) {
            return {
                file, severity: "MEDIUM",
                issue: `DX: O objetivo '${objective}' exige interface premium. Em '${file}', saídas silenciosas prejudicam a experiência Bun.`,
                context: "process.exit detected"
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em DX e experiência de CLI Bun.`;
    }
}
