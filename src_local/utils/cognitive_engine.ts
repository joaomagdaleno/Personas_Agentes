import winston from 'winston';

/**
 * 🧠 Cérebro Local (Bridge to SLM).
 * Gerencia o raciocínio via API local (Ollama ou similar).
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger: winston.Logger;
    private initialized: boolean = false;
    private modelName: string = "qwen2.5-coder:1.5b";
    private endpoint: string = process.env.AI_ENDPOINT || "http://localhost:11434/api/generate";

    constructor() {
        if (CognitiveEngine.instance) return CognitiveEngine.instance;

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} - Cognitive - ${level.toUpperCase()} - ${message}`)
            ),
            transports: [new winston.transports.Console()]
        });

        this.initialized = true;
        CognitiveEngine.instance = this;
    }

    /**
     * Processa um pensamento usando o modelo de linguagem.
     * Implementado como bridge HTTP para compatibilidade com Bun.
     */
    async reason(prompt: string, options: { temperature?: number, max_tokens?: number } = {}): Promise<string | null> {
        this.logger.info(`🧠 [Cognitive] Raciocinando sobre objetivo...`);

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.modelName,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: options.temperature || 0.7,
                        num_predict: options.max_tokens || 1024
                    }
                })
            });

            if (!response.ok) {
                this.logger.warn(`⚠️ [Cognitive] API indisponível (${response.status}). Usando fallback heurístico.`);
                return null;
            }

            const data: any = await response.json();
            return data.response || null;
        } catch (error) {
            this.logger.error(`❌ [Cognitive] Falha na conexão com o Cérebro: ${error}`);
            return null;
        }
    }
}
