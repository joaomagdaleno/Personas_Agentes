
import { CognitiveEngine } from "../../../utils/cognitive_engine";
import winston from "winston";

const logger = winston.child({ module: "DocGen" });

export class DocGenAgent {
    private brain: CognitiveEngine;

    constructor() {
        this.brain = new CognitiveEngine();
    }

    /**
     * Gera uma docstring de cabeçalho soberana para o arquivo.
     */
    async generateDocstring(fileName: string, content: string): Promise<string> {
        logger.info(`✍️ [DocGen] Gerando propósito para ${fileName}...`);

        // Limita o contexto para economia de tokens (Legacy Logic: 1500 chars)
        const partialContent = content.slice(0, 1500);

        const prompt = `Analise o código abaixo e gere uma documentação de cabeçalho concisa em PORTUGUÊS.
Arquivo: ${fileName}
Amostra de Código:
${partialContent}

Requisitos:
1. Explique o PROPÓSITO principal do arquivo.
2. Liste as principais responsabilidades.
3. Use o formato JSDoc (/** ... */) para TypeScript ou Docstring (""" ... """) para Python.
4. Responda APENAS com o bloco de comentário.`;

        try {
            const answer = await this.brain.reason(prompt);
            return answer ?? "/** Falha na geração automática de documentação (Resposta Nula). */";
        } catch (error) {
            logger.error(`❌ [DocGen] Falha na geração de documentação: ${error}`);
            return "/** Falha na geração automática de documentação. */";
        }
    }
}
