import { BaseActivePersona } from "../../base_persona.ts";
import winston from "winston";

const logger = winston.child({ module: "TS_Scribe" });

/**
 * 📝 Dr. Scribe — PhD in TypeScript Documentation & Knowledge
 * Especialista em JSDoc, documentação de APIs e clareza de código.
 */
export class ScribePersona extends BaseActivePersona {
    constructor(projectRoot: string | null = null) {
        super(projectRoot);
        this.name = "Scribe";
        this.emoji = "📝";
        this.role = "PhD Documentation Engineer";
        this.stack = "TypeScript";
    }

    async performAudit(): Promise<any[]> {
        const start = Date.now();
        logger.info(`[${this.name}] Analisando Documentation TypeScript...`);

        const results: any[] = [];
        for (const [filePath, content] of Object.entries(this.contextData)) {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
            if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) continue;

            // Check for exported functions/classes without JSDoc
            const exportMatches = (content as string).match(/export\s+(?:async\s+)?(?:function|class|const|interface|type|enum)\s+\w+/g);
            const jsdocCount = ((content as string).match(/\/\*\*[\s\S]*?\*\//g) || []).length;

            if (exportMatches && exportMatches.length > 0 && jsdocCount === 0) {
                results.push({
                    file: filePath,
                    issue: `Amnésia Técnica: ${exportMatches.length} exportações sem nenhum JSDoc — caixa preta total.`,
                    severity: 'high', persona: this.name
                });
            } else if (exportMatches && exportMatches.length > jsdocCount * 2) {
                results.push({
                    file: filePath,
                    issue: `Documentação Parcial: ${exportMatches.length} exportações mas apenas ${jsdocCount} blocos JSDoc.`,
                    severity: 'medium', persona: this.name
                });
            }
        }

        const duration = (Date.now() - start) / 1000;
        logger.info(`[${this.name}] Auditoria concluída em ${duration.toFixed(4)}s. Achados: ${results.length}`);
        return results;
    }

    async reasonAboutObjective(objective: string, file: string, content: string): Promise<any | null> {
        const exports = (content.match(/export\s+(?:async\s+)?(?:function|class)\s+\w+/g) || []).length;
        const docs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
        if (exports > 0 && docs === 0) {
            return {
                file, severity: "HIGH", persona: this.name,
                issue: `Amnésia Técnica: O objetivo '${objective}' exige clareza. Em '${file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta.`
            };
        }
        return {
            file, severity: "INFO", persona: this.name,
            issue: `PhD Scribe: Analisando explicabilidade para ${objective}. Focando em JSDoc e clareza de intenção.`
        };
    }

    selfDiagnostic(): any {
        return {
            status: "Soberano",
            score: 100,
            details: "Arquivista de conhecimento TS operando com clareza PhD."
        };
    }

    getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, mestre em documentação e transferência de conhecimento TypeScript.`;
    }
}
