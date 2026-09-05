import winston from "winston";
import { LocalSLMEngine, type LocalSLMConfig, type LocalSLMResponse } from "./local_slm_engine.ts";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - DualAPI[Sovereign] - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface DualAPIConfig extends LocalSLMConfig {
    geminiApiKey?: string;
    geminiModel?: string;
    geminiMaxRpm?: number;
}

export interface DualAPIResponse {
    text: string;
    provider: "local-slm" | "huggingface" | "fallback" | "gemini";
    model: string;
    latencyMs: number;
    fallbackTriggered: boolean;
}

/**
 * DualAPIEngine retrocompatível 100% Soberana.
 * A API do Google (Gemini) foi eliminada e substituída pelo motor Local SLM (Llama.cpp / GGUF).
 */
export class DualAPIEngine {
    private static instance: DualAPIEngine;
    private localEngine: LocalSLMEngine;
    private activeProvider: "local-slm" | "huggingface" = "local-slm";

    constructor(config: DualAPIConfig = {}) {
        this.localEngine = new LocalSLMEngine(config);
    }

    public static getInstance(config?: DualAPIConfig): DualAPIEngine {
        if (!DualAPIEngine.instance) {
            DualAPIEngine.instance = new DualAPIEngine(config);
        }
        return DualAPIEngine.instance;
    }

    public async generate(prompt: string, options: { temperature?: number; maxTokens?: number; context?: string } = {}): Promise<DualAPIResponse> {
        const res = await this.localEngine.generate(prompt, options);
        return {
            text: res.text,
            provider: res.provider,
            model: res.model,
            latencyMs: res.latencyMs,
            fallbackTriggered: res.fallbackTriggered
        };
    }

    public getHealthStatus(): {
        activeProvider: string;
        geminiConfigured: boolean;
        localSlmConfigured: boolean;
        huggingFaceConfigured: boolean;
        requestsInLastMinute: number;
        lastSwitchReason: string;
    } {
        const health = this.localEngine.getHealthStatus();
        return {
            activeProvider: health.activeProvider,
            geminiConfigured: false, // Google Gemini completamente removido
            localSlmConfigured: true,
            huggingFaceConfigured: health.huggingFaceConfigured,
            requestsInLastMinute: health.requestsInLastMinute,
            lastSwitchReason: health.lastSwitchReason
        };
    }
}

export { LocalSLMEngine };
