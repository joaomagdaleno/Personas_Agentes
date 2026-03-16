import winston from "winston";
import { HubManagerGRPC } from "./hub_manager_grpc.ts";

const logger = winston.child({ module: "DocEngine" });

/**
 * Motor de Documentação PhD.
 * Delega o pipeline de documentação para o Hub Nativo usando a identidade 'doc_gen'.
 */
export class DocEngine {
    private hubManager: HubManagerGRPC;

    constructor(hubManager?: HubManagerGRPC) {
        this.hubManager = hubManager || HubManagerGRPC.getInstance();
    }

    /**
     * Gera uma docstring de cabeçalho soberana para o arquivo usando gRPC Hub.
     */
    async generateDocstring(fileName: string, content: string): Promise<string> {
        logger.info(`✍️ [DocEngine] Gerando propósito para ${fileName} via pipeline nativo...`);

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
            // Em vez do antigo CognitiveEngine, delegamos a tarefa cognitiva nativamente à Persona 'doc_gen'.
            // Utilizando o identity ID registrado.
            const answer = await this.hubManager.reason(prompt);
            return answer ?? "/** Falha na geração automática de documentação (Resposta Nula). */";
        } catch (error) {
            logger.error(`❌ [DocEngine] Falha na geração de documentação: ${error}`);
            return "/** Falha na geração automática de documentação. */";
        }
    }
}
