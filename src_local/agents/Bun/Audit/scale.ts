import { BaseActivePersona, AuditRule, StrategicFinding } from "../../base.ts";
import winston from "winston";

const logger = winston.child({ module: "Bun_Scale" });

/**
 * 🏗️ Dr. Scale — PhD in Bun Architecture & Worker Scaling
 * Especialista em arquitetura Bun, workers, monólitos e separação de responsabilidades.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Bun Architecture Engineer";
        this.stack = "Bun";
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: ['.ts', '.tsx'],
            rules: [
                { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia.", severity: "high" },
                { regex: /import\s+.*from\s+['"]\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
                { regex: /static\s+\w+\s+\w+/, issue: "Static Abuse: Uso excessivo de membros estáticos pode dificultar testes e escalabilidade.", severity: "low" },
                { regex: /import\s+.*from\s+['"].*\/internal\/.*['"]/, issue: "Internal Leak: Importando de diretório interno de outro módulo.", severity: "high" },
                { regex: /Bun\.spawn|Bun\.Worker/, issue: "Resource Check: Verifique se processos/workers são encerrados corretamente.", severity: "medium" },
                { regex: /import\s+.*\{[\s\S]{500,}\}/, issue: "Massive Import: Lista de importação muito longa; sugere quebras de SRP.", severity: "low" }
            ]
        };
    }

    reasonAboutObjective(objective: string, file: string, content: string | Promise<string | null>): StrategicFinding | string | null {
        if (typeof content !== 'string') return null;
        const lines = content.split('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH",
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade Bun. O arquivo '${file}' com ${lines.length} linhas é um monólito.`,
                context: `File length: ${lines.length} lines`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Bun.`;
    }
}
