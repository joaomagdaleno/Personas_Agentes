import { BaseActivePersona } from "../../base_persona.ts";
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

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Arquitetura Bun...`);

        const results: any[] = [];
        const rules: AuditRule[] = [
            { regex: /\n{400,}/, issue: "God File: Arquivo excessivamente grande; risco de entropia.", severity: "high" },
            { regex: /import\s+.*from\s+['"]\.\.\/\.\.\//, issue: "Deep Relative: Importação excessivamente profunda; risco de acoplamento.", severity: "medium" },
            { regex: /static\s+\w+\s+\w+/, issue: "Static Abuse: Uso excessivo de membros estáticos pode dificultar testes e escalabilidade.", severity: "low" },
            { regex: /import\s+.*from\s+['"].*\/internal\/.*['"]/, issue: "Internal Leak: Importando de diretório interno de outro módulo.", severity: "high" },
            { regex: /Bun\.spawn|Bun\.Worker/, issue: "Resource Check: Verifique se processos/workers são encerrados corretamente.", severity: "medium" },
            { regex: /import\s+.*\{[\s\S]{500,}\}/, issue: "Massive Import: Lista de importação muito longa; sugere quebras de SRP.", severity: "low" }
        ];

        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;

            // Apply regex rules
            for (const rule of rules) {
                const regex = new RegExp(rule.regex, 'g');
                if (regex.test(content as string)) {
                    results.push({ file: filePath, issue: rule.issue, severity: rule.severity, persona: this.name });
                }
            }

            // Programmatic God File check (Fallback)
            const lines = (content as string).split('\n');
            if (lines.length > 400 && !results.some(r => r.file === filePath && r.issue.includes("God File"))) {
                results.push({ file: filePath, issue: `God File (Programmatic): ${lines.length} linhas.`, severity: 'high', persona: this.name });
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const lines = content.split('\n');
        if (lines.length > 400) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade Bun. O arquivo '${file}' com ${lines.length} linhas é um monólito.`
            };
        }
        return null;
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade Bun.`;
    }
}
