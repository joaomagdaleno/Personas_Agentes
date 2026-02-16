
import { CognitiveEngine } from "../../../utils/cognitive_engine";
import winston from "winston";

const logger = winston.child({ module: "TestRefiner" });

/**
 * 🧠 TestRefiner
 * Especialista cognitivo que usa o SLM para sugerir melhorias em testes ou explicar falhas complexas.
 */
export class TestRefiner {
    private brain: CognitiveEngine;

    constructor() {
        this.brain = new CognitiveEngine();
    }

    /**
     * Analisa um erro de teste e sugere correção via IA.
     */
    async analyzeFailure(testFile: string, errorLog: string): Promise<string> {
        logger.info(`🧠 [TestRefiner] Analisando falha em ${testFile}...`);

        const prompt = `Analise o seguinte erro de teste (Bun Test/Jest):
Arquivo: ${testFile}
Erro:
${errorLog}

1. Explique a causa provável.
2. Sugira uma correção breve no código do teste ou da implementação.
3. Se for um erro de asserção, sugira como corrigir a expectativa.`;

        try {
            const answer = await this.brain.reason(prompt);
            return answer ?? "Falha na análise via IA (Resposta Nula).";
        } catch (error) {
            logger.error(`❌ [TestRefiner] Falha na análise: ${error}`);
            return "Erro ao analisar falha via IA.";
        }
    }

    /**
     * Gera um caso de teste para o código fornecido.
     */
    async suggestTestCase(codeSnippet: string): Promise<string> {
        logger.info(`🧠 [TestRefiner] Sugerindo caso de teste...`);

        const prompt = `Escreva um caso de teste robusto (bun:test) para este código:
\`\`\`typescript
${codeSnippet}
\`\`\`

Inclua imports necessários e assertions claras.`;

        try {
            const answer = await this.brain.reason(prompt);
            return answer ?? "// Falha na geração do teste (Resposta Nula).";
        } catch (error) {
            logger.error(`❌ [TestRefiner] Falha na sugestão: ${error}`);
            return "// Falha na geração do teste.";
        }
    }
}
