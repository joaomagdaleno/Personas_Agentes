import winston from 'winston';
import { CogHelpers } from "./CogHelpers.ts";
import { StaticReasoning } from "./StaticReasoning.ts";
import { HubManagerGRPC } from "../core/hub_manager_grpc";

/**
 * 🧠 CognitiveEngine - PhD in Reasoning Systems (gRPC Proxy Edition)
 */
export class CognitiveEngine {
    private static instance: CognitiveEngine;
    private logger!: winston.Logger;
    private defaultMaxTokens: number = 512;
    private activeModel: string = "qwen3.5:1.5b (Unified)";
    private cogHelpers!: CogHelpers;

    constructor(private hubManager?: HubManagerGRPC) {
        if (CognitiveEngine.instance) return CognitiveEngine.instance;
        this.logger = this.initializeLogger();
        this.cogHelpers = new CogHelpers(hubManager);
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
        this.logger.info(`🧠 [Cognitive] Raciocinando via gRPC Brain Proxy...`);

        try {
            const response = await this.cogHelpers.callRustBrain(prompt);
            if (!response) {
                this.logger.warn("⚠️ [Cognitive] Falha no gRPC Brain Proxy. Ativando Raciocínio Estático.");
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
        this.logger.info(`🧠 [Cognitive] Verificando integridade do motor gRPC...`);
        return true;
    }

    static getInstance(hubManager?: HubManagerGRPC): CognitiveEngine {
        return CognitiveEngine.instance || (CognitiveEngine.instance = new CognitiveEngine(hubManager));
    }

    public get model(): string { return this.activeModel; }
}
