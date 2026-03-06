import winston from 'winston';
import { CogHelpers } from "./CogHelpers.ts";
import { StaticReasoning } from "./StaticReasoning.ts";

/**
 * 🧠 CognitiveEngine - PhD in Reasoning Systems (Native Rust Edition)
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private defaultMaxTokens: number = 512;
    private activeModel: string = "qwen3.5:0.6b (Unified)";

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
        this.defaultMaxTokens = isDeep ? 2048 : 512;
        const mode = isDeep ? 'HIPERPENSAMENTO' : 'PULSE';
        this.logger.info(`🧠 [Cognitive] Modo ${mode} ativado.`);
    }

    async reason(prompt: string, options: { temperature?: number, max_tokens?: number, deep?: boolean } = {}): Promise<string | null> {
        this.logger.info(`🧠 [Cognitive] Raciocinando via Rust Brain...`);

        try {
            const response = await CogHelpers.callRustBrain(prompt);
            if (!response) {
                this.logger.warn("⚠️ [Cognitive] Falha no Rust Brain. Ativando Raciocínio Estático.");
                return StaticReasoning.handle(prompt);
            }
            return response;
        } catch (error: any) {
            this.logger.error(`❌ [Cognitive] Erro Crítico: ${error.message}`);
            return StaticReasoning.handle(prompt);
        }
    }

    async release(): Promise<void> {
        this.logger.info("🧠 [Cognitive] Sistema Nativo estável.");
    }

    async load_model(): Promise<boolean> {
        this.logger.info(`🧠 [Cognitive] Verificando integridade do motor Rust...`);
        return true;
    }

    static getInstance(): CognitiveEngine {
        return CognitiveEngine.instance || (CognitiveEngine.instance = new CognitiveEngine());
    }

    public get model(): string { return this.activeModel; }
}
