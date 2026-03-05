import winston from 'winston';
import { CogHelpers } from "./CogHelpers.ts";
import { StaticReasoning } from "./StaticReasoning.ts";

/**
 * 🧠 CognitiveEngine - PhD in Reasoning Systems
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private modelName: string = "qwen2.5-coder:1.5b";
    private endpoint: string = process.env.AI_ENDPOINT || "http://localhost:8080/api/generate";
    private defaultMaxTokens: number = 512;
    private activeModel: string | null = null;

    constructor() {
        if (CognitiveEngine.instance) return CognitiveEngine.instance;
        this.logger = this.initializeLogger();
        CognitiveEngine.instance = this;
    }

    private initializeLogger(): winston.Logger {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => `${timestamp} - Cognitive - ${level.toUpperCase()} - ${message}`)
            ),
            transports: [new winston.transports.Console()]
        });
    }

    public setThinkingDepth(isDeep: boolean = false): void {
        this.defaultMaxTokens = isDeep ? 4096 : 512;
        const mode = isDeep ? 'HIPERPENSAMENTO' : 'PULSE';
        this.logger.info(`🧠 [Cognitive] Modo ${mode} ativado.`);
    }

    async reason(prompt: string, options: { temperature?: number, max_tokens?: number, deep?: boolean } = {}): Promise<string | null> {
        this.applyThinkingOptions(options);
        this.logger.info(`🧠 [Cognitive] Raciocinando...`);

        try {
            return await this.callAiService(prompt, options);
        } catch (error: any) {
            return this.handleReasoningError(error, prompt);
        }
    }

    private applyThinkingOptions(options: any) {
        if (options.deep) {
            this.setThinkingDepth(true);
        }
    }

    private async callAiService(prompt: string, options: any): Promise<string | null> {
        const params = CogHelpers.getParams(options, this.defaultMaxTokens);
        const data = await CogHelpers.callOllama(this.endpoint, {
            model: this.modelName,
            prompt,
            stream: false,
            options: params
        });

        if (!data) return null;
        this.activeModel = this.modelName;
        return data.response || null;
    }

    private handleReasoningError(error: any, prompt: string): string | null {
        this.logger.error(`❌ [Cognitive] Falha de conexão: ${error.message || error}`);

        if (this.isConnectionFailure(error)) {
            this.logger.warn("⚠️ [Cognitive] Servidor Ollama indisponível. Ativando Raciocínio Estático.");
            return StaticReasoning.handle(prompt);
        }
        return null;
    }

    private isConnectionFailure(error: any): boolean {
        const msg = error.message || "";
        return msg.includes("ECONNREFUSED") || msg.includes("Unable to connect");
    }

    async release(): Promise<void> {
        this.logger.info("🧠 [Cognitive] Descarregando...");
        const success = await CogHelpers.unloadModel(this.endpoint, this.modelName);
        if (success) {
            this.activeModel = null;
        }
    }

    async load_model(modelName?: string): Promise<boolean> {
        if (modelName) this.modelName = modelName;
        this.logger.info(`🧠 [Cognitive] Aquecendo '${this.modelName}'...`);

        const data = await CogHelpers.callOllama(this.endpoint, {
            model: this.modelName,
            prompt: "ping",
            stream: false,
            options: { num_predict: 1 }
        });

        if (data) {
            this.activeModel = this.modelName;
            return true;
        }
        return false;
    }

    static getInstance(): CognitiveEngine {
        return CognitiveEngine.instance || (CognitiveEngine.instance = new CognitiveEngine());
    }

    public get model(): string | null { return this.activeModel; }
}
