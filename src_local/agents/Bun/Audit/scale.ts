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
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
            const lines = (content as string).split('\n');
            if (lines.length > 400) {
                results.push({ file: filePath, issue: `God File: ${lines.length} linhas — arquivo Bun monolítico.`, severity: 'high', persona: this.name });
            }
            const classCount = ((content as string).match(/class\s+\w+/g) || []).length;
            if (classCount > 3) {
                results.push({ file: filePath, issue: `Multi-Classe: ${classCount} classes em um arquivo — violar separação de responsabilidades.`, severity: 'medium', persona: this.name });
            }
        }

        // Check for bundler config
        const hasBunfig = Object.keys(this.contextData).some(f => f.endsWith('bunfig.toml'));
        if (!hasBunfig) {
            results.push({ file: 'ROOT', issue: 'Ausência: Projeto Bun sem bunfig.toml — sem configuração otimizada.', severity: 'medium', persona: this.name });
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
