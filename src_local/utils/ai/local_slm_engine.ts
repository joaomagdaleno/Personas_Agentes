import winston from "winston";
import { WarmPurgeOfflineEngine } from "./warm_purge_offline_engine.ts";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - LocalSLM - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface LocalSLMConfig {
    modelName?: string;
    threads?: number;
    huggingFaceApiKey?: string;
    huggingFaceModel?: string;
    timeoutMs?: number;
    // Retrocompatibility fields
    geminiApiKey?: string;
    geminiModel?: string;
    geminiMaxRpm?: number;
}

export interface LocalSLMResponse {
    text: string;
    provider: "local-slm" | "huggingface" | "fallback";
    model: string;
    latencyMs: number;
    fallbackTriggered: boolean;
}

export class LocalSLMEngine {
    private static instance: LocalSLMEngine;

    private modelName: string;
    private huggingFaceApiKey: string;
    private huggingFaceModel: string;
    private timeoutMs: number;
    private activeProvider: "local-slm" | "huggingface" = "local-slm";
    private lastSwitchReason: string = "initial";

    constructor(config: LocalSLMConfig = {}) {
        this.modelName = config.modelName || process.env.LOCAL_SLM_MODEL || "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf";

        const rawHfKey = config.huggingFaceApiKey || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
        const isPlaceholder = (k: string) => !k || k.includes("YOUR_") || k.includes("placeholder") || k.length < 10;
        this.huggingFaceApiKey = isPlaceholder(rawHfKey) ? "" : rawHfKey;
        this.huggingFaceModel = config.huggingFaceModel || "Qwen/Qwen2.5-Coder-7B-Instruct";
        this.timeoutMs = config.timeoutMs || 10000;
    }

    public static getInstance(config?: LocalSLMConfig): LocalSLMEngine {
        if (!LocalSLMEngine.instance) {
            LocalSLMEngine.instance = new LocalSLMEngine(config);
        }
        return LocalSLMEngine.instance;
    }

    /**
     * Executes an AI prompt through the primary local SLM engine (WarmPurge / Llama.cpp),
     * with zero external cloud dependencies to Google.
     */
    public async generate(prompt: string, options: { temperature?: number; maxTokens?: number; context?: string } = {}): Promise<LocalSLMResponse> {
        const startTime = Date.now();
        const temperature = options.temperature ?? 0.2;
        const maxTokens = options.maxTokens ?? 1024;

        // 1. Primary Engine: Sovereign Local SLM (WarmPurge / Llama.cpp)
        try {
            logger.info(`⚡ [LocalSLM] Executando inferência local via WarmPurge (${this.modelName})...`);
            const offlineEngine = WarmPurgeOfflineEngine.getInstance();
            const text = await offlineEngine.generate(prompt, {
                context: options.context,
                temperature,
                maxTokens
            });

            if (text && text.trim().length > 0) {
                this.activeProvider = "local-slm";
                return {
                    text,
                    provider: "local-slm",
                    model: this.modelName,
                    latencyMs: Date.now() - startTime,
                    fallbackTriggered: false
                };
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.warn(`⚠️ [LocalSLM] Erro no motor local: ${msg}.`);
            this.lastSwitchReason = `Local error: ${msg}`;
        }

        // 2. Secondary / Optional Failover: Hugging Face Serverless (se configurado)
        if (this.huggingFaceApiKey.length > 0) {
            try {
                logger.info(`🌐 [LocalSLM] Roteando requisição para failover Hugging Face (${this.huggingFaceModel})...`);
                const text = await this.callHuggingFace(prompt, temperature, maxTokens);
                if (text && text.trim().length > 0) {
                    this.activeProvider = "huggingface";
                    return {
                        text,
                        provider: "huggingface",
                        model: this.huggingFaceModel,
                        latencyMs: Date.now() - startTime,
                        fallbackTriggered: true
                    };
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.warn(`⚠️ [LocalSLM] Falha no motor Hugging Face: ${msg}.`);
                this.lastSwitchReason = `HF error: ${msg}`;
            }
        }

        // 3. Fallback Gracioso Local
        logger.warn("⚠️ [LocalSLM] Retornando fallback determinístico local.");
        return {
            text: "",
            provider: "fallback",
            model: "static-fallback",
            latencyMs: Date.now() - startTime,
            fallbackTriggered: true
        };
    }

    /**
     * Calls Hugging Face Serverless Inference API (se configurado)
     */
    private async callHuggingFace(prompt: string, temperature: number, maxTokens: number): Promise<string> {
        const url = `https://api-inference.huggingface.co/models/${this.huggingFaceModel}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.huggingFaceApiKey}`
                },
                signal: controller.signal,
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        temperature: Math.max(0.01, temperature),
                        max_new_tokens: maxTokens,
                        return_full_text: false
                    }
                })
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`HTTP ${res.status}: ${errBody}`);
            }

            const data = (await res.json()) as any;
            if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
                return data[0].generated_text;
            }
            if (data?.generated_text) {
                return data.generated_text;
            }
            throw new Error("Formato de resposta inesperado da Hugging Face");
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Returns real-time health and telemetry metrics for the local SLM engine.
     */
    public getHealthStatus(): {
        activeProvider: string;
        localSlmConfigured: boolean;
        geminiConfigured: boolean;
        huggingFaceConfigured: boolean;
        requestsInLastMinute: number;
        lastSwitchReason: string;
        modelName: string;
    } {
        return {
            activeProvider: this.activeProvider,
            localSlmConfigured: true,
            geminiConfigured: false, // Explicitly removed Google Gemini
            huggingFaceConfigured: this.huggingFaceApiKey.length > 0,
            requestsInLastMinute: 0,
            lastSwitchReason: this.lastSwitchReason,
            modelName: this.modelName
        };
    }
}
