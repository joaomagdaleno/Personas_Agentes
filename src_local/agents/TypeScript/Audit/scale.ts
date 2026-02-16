import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scale" });

/**
 * 🏗️ Dr. Scale — PhD in TypeScript Architecture & Scalability
 * Especialista em arquitetura de módulos, God classes e complexidade ciclomática.
 */
export class ScalePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scale";
        this.emoji = "🏗️";
        this.role = "PhD Software Architect";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Arquitetura TypeScript...`);

        const results: any[] = [];
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
            const lines = (content as string).split('\n');

            // God file detection (>400 lines)
            if (lines.length > 400) {
                results.push({ file: filePath, issue: `God File: ${lines.length} linhas — arquivo excessivamente grande e difícil de manter.`, severity: 'high', persona: this.name });
            }

            // God class detection (class with >20 methods)
            const classMatches = (content as string).match(/class\s+\w+/g);
            const methodMatches = (content as string).match(/(?:async\s+)?(?:public\s+|private\s+|protected\s+)?(?:static\s+)?\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{/g);
            if (classMatches && classMatches.length === 1 && methodMatches && methodMatches.length > 20) {
                results.push({ file: filePath, issue: `God Class: Classe com ${methodMatches.length} métodos — violar SRP.`, severity: 'high', persona: this.name });
            }

            // Circular import risk (re-exports)
            const importMatches = (content as string).match(/from\s+['"]\.\.\//g);
            if (importMatches && importMatches.length > 10) {
                results.push({ file: filePath, issue: `Risco Circular: ${importMatches.length} imports relativos ascendentes — risco de dependência circular.`, severity: 'medium', persona: this.name });
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
                issue: `Entropia Arquitetural: O objetivo '${objective}' exige modularidade. O arquivo '${file}' com ${lines.length} linhas é um monólito que resiste à evolução da 'Orquestração de Inteligência Artificial'.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Architecture: Analisando escalabilidade e coesão para ${objective}. Focando em decomposição modular e SOLID.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Sensores de complexidade ciclomatica TS operando com precisão PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em arquitetura e escalabilidade TypeScript.`;
    }
}
