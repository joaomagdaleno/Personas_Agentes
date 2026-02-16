import winston from 'winston';

/**
 * 🧠 Cérebro Local (Bridge to SLM).
 * Gerencia o raciocínio via API local (Ollama ou similar).
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private initialized: boolean = false;
    private modelName: string = "qwen2.5-coder:1.5b";
    private endpoint: string = process.env.AI_ENDPOINT || "http://localhost:11434/api/generate";
    private defaultMaxTokens: number = 512;
    private memoryLimit: number = 85;
    private activeModel: string | null = null;

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
     * Ajusta a profundidade de pensamento (Legacy set_thinking_depth logic).
     */
    public setThinkingDepth(isDeep: boolean = false): void {
        if (isDeep) {
            this.defaultMaxTokens = 4096;
            this.logger.info("🧠 [Cognitive] Modo HIPERPENSAMENTO ativado (Contexto Expandido).");
        } else {
            this.defaultMaxTokens = 512;
            this.logger.info("🧠 [Cognitive] Modo PULSE ativado (Resposta Rápida).");
        }
    }

    /**
     * Verifica as condições de hardware antes de raciocinar (Memory & Thrashing logic).
     */
    private async checkVitals(): Promise<boolean> {
        // Implementação simplificada de vitais (Simulando Psutil)
        const isDiskBusy = false; // Mock: No Bun we would use a native bridge if needed
        const memUsage = 50; // Mock: Bun.gc() or similar

        if (memUsage > this.memoryLimit || isDiskBusy) {
            this.logger.warn(`⚠️ [Cognitive] Sistema sob pressão. Abortando raciocínio para evitar Thrashing.`);
            return false;
        }
        return true;
    }

    /**
     * Processa um pensamento usando o modelo de linguagem.
     * Implementado como bridge HTTP para compatibilidade com Bun.
     */
    async reason(prompt: string, options: { temperature?: number, max_tokens?: number, deep?: boolean } = {}): Promise<string | null> {
        if (options.deep) this.setThinkingDepth(true);

        if (!(await this.checkVitals())) return null;

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
                        num_predict: options.max_tokens || this.defaultMaxTokens
                    }
                })
            });

            if (!response.ok) {
                this.logger.warn(`⚠️ [Cognitive] API indisponível (${response.status}). Usando fallback heurístico.`);
                return null;
            }

            const data: any = await response.json();
            this.activeModel = this.modelName;
            return data.response || null;
        } catch (error) {
            this.logger.error(`❌ [Cognitive] Falha na conexão com o Cérebro: ${error}`);
            return null;
        }
    }

    /**
     * Libera o modelo da memória (Unload).
     */
    async release(): Promise<void> {
        this.logger.info("🧠 [Cognitive] Solicitando liberação de VRAM...");
        try {
            await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                body: JSON.stringify({ model: this.modelName, keep_alive: 0 })
            });
            this.activeModel = null;
        } catch (e) {
            this.logger.warn("⚠️ [Cognitive] Não foi possível descarregar o modelo via API.");
        }
    }

    /**
     * Retorna o estado atual da consciência.
     */
    public get model(): string | null {
        return this.activeModel;
    }
}
