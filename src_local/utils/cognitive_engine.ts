import winston from 'winston';
import { CogHelpers } from "./CogHelpers.ts";

/**
 * 🧠 CognitiveEngine - PhD in Reasoning Systems
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private modelName: string = "qwen2.5-coder:1.5b";
    private endpoint: string = process.env.AI_ENDPOINT || "http://localhost:11434/api/generate";
    private defaultMaxTokens: number = 512;
    private activeModel: string | null = null;

    constructor() {
        if (CognitiveEngine.instance) return CognitiveEngine.instance;
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(({ timestamp, level, message }) => `${timestamp} - Cognitive - ${level.toUpperCase()} - ${message}`)),
            transports: [new winston.transports.Console()]
        });
        CognitiveEngine.instance = this;
    }

    public setThinkingDepth(isDeep: boolean = false): void {
        this.defaultMaxTokens = isDeep ? 4096 : 512;
        this.logger.info(`🧠 [Cognitive] Modo ${isDeep ? 'HIPERPENSAMENTO' : 'PULSE'} ativado.`);
    }

    async reason(prompt: string, options: { temperature?: number, max_tokens?: number, deep?: boolean } = {}): Promise<string | null> {
        if (options.deep) this.setThinkingDepth(true);
        this.logger.info(`🧠 [Cognitive] Raciocinando...`);
        try {
            const data = await CogHelpers.callOllama(this.endpoint, { model: this.modelName, prompt, stream: false, options: CogHelpers.getParams(options, this.defaultMaxTokens) });
            if (!data) return null;
            this.activeModel = this.modelName;
            return data.response || null;
        } catch (error) {
            this.logger.error(`❌ [Cognitive] Falha: ${error}`);
            return null;
        }
    }

    async release(): Promise<void> {
        this.logger.info("🧠 [Cognitive] Descarregando...");
        if (await CogHelpers.unloadModel(this.endpoint, this.modelName)) this.activeModel = null;
    }

    async load_model(modelName?: string): Promise<boolean> {
        if (modelName) this.modelName = modelName;
        this.logger.info(`🧠 [Cognitive] Aquecendo '${this.modelName}'...`);
        const data = await CogHelpers.callOllama(this.endpoint, { model: this.modelName, prompt: "ping", stream: false, options: { num_predict: 1 } });
        if (data) { this.activeModel = this.modelName; return true; }
        return false;
    }

    static getInstance(): CognitiveEngine { return CognitiveEngine.instance || (CognitiveEngine.instance = new CognitiveEngine()); }
    public get model(): string | null { return this.activeModel; }
}
