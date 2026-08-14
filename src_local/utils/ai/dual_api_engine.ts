import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - DualAPI - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export interface DualAPIConfig {
    geminiApiKey?: string;
    geminiModel?: string;
    huggingFaceApiKey?: string;
    huggingFaceModel?: string;
    timeoutMs?: number;
    geminiMaxRpm?: number;
}

export interface DualAPIResponse {
    text: string;
    provider: "gemini" | "huggingface" | "fallback";
    model: string;
    latencyMs: number;
    fallbackTriggered: boolean;
}

export class DualAPIEngine {
    private static instance: DualAPIEngine;

    private geminiApiKey: string;
    private geminiModel: string;
    private huggingFaceApiKey: string;
    private huggingFaceModel: string;
    private timeoutMs: number;
    private geminiMaxRpm: number;

    private requestTimestamps: number[] = [];
    private activeProvider: "gemini" | "huggingface" = "gemini";
    private lastSwitchReason: string = "initial";

    constructor(config: DualAPIConfig = {}) {
        this.geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
        this.geminiModel = config.geminiModel || "gemini-1.5-flash";
        this.huggingFaceApiKey = config.huggingFaceApiKey || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
        this.huggingFaceModel = config.huggingFaceModel || "Qwen/Qwen2.5-Coder-7B-Instruct";
        this.timeoutMs = config.timeoutMs || 10000;
        this.geminiMaxRpm = config.geminiMaxRpm || 15;
    }

    public static getInstance(config?: DualAPIConfig): DualAPIEngine {
        if (!DualAPIEngine.instance) {
            DualAPIEngine.instance = new DualAPIEngine(config);
        }
        return DualAPIEngine.instance;
    }

    /**
     * Executes an AI prompt through the primary (Gemini 1.5 Flash) engine with
     * automatic silent failover to Hugging Face Serverless if quota or error occurs.
     */
    public async generate(prompt: string, options: { temperature?: number; maxTokens?: number } = {}): Promise<DualAPIResponse> {
        const startTime = Date.now();
        const temperature = options.temperature ?? 0.2;
        const maxTokens = options.maxTokens ?? 1024;

        // Check if Gemini is eligible (has key and is within RPM quota)
        const canUseGemini = this.geminiApiKey.length > 0 && this.checkAndRecordRateLimit();

        if (canUseGemini) {
            try {
                logger.info(`✨ [DualAPI] Roteando requisição para motor primário Gemini (${this.geminiModel})...`);
                const text = await this.callGemini(prompt, temperature, maxTokens);
                if (text && text.trim().length > 0) {
                    this.activeProvider = "gemini";
                    return {
                        text,
                        provider: "gemini",
                        model: this.geminiModel,
                        latencyMs: Date.now() - startTime,
                        fallbackTriggered: false
                    };
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.warn(`⚠️ [DualAPI] Falha no motor Gemini: ${msg}. Ativando failover para Hugging Face...`);
                this.lastSwitchReason = `Gemini error: ${msg}`;
            }
        } else if (this.geminiApiKey.length === 0) {
            logger.debug("ℹ️ [DualAPI] GEMINI_API_KEY não configurada. Utilizando Hugging Face Serverless.");
        } else {
            logger.warn(`⚠️ [DualAPI] Limite de RPM atingido para Gemini (${this.geminiMaxRpm} req/min). Comutando para Hugging Face...`);
            this.lastSwitchReason = "Gemini RPM rate limit exceeded";
        }

        // Secondary / Failover: Hugging Face Serverless
        if (this.huggingFaceApiKey.length > 0) {
            try {
                logger.info(`🌐 [DualAPI] Roteando requisição para failover Hugging Face (${this.huggingFaceModel})...`);
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
                logger.warn(`⚠️ [DualAPI] Falha no motor Hugging Face: ${msg}.`);
                this.lastSwitchReason = `HF error: ${msg}`;
            }
        }

        // Fallback gracefully if no external API succeeded
        logger.warn("⚠️ [DualAPI] Nenhuma API em nuvem respondeu. Retornando resposta padrão de fallback.");
        return {
            text: "",
            provider: "fallback",
            model: "static-fallback",
            latencyMs: Date.now() - startTime,
            fallbackTriggered: true
        };
    }

    /**
     * Calls Google Gemini 1.5 Flash API
     */
    private async callGemini(prompt: string, temperature: number, maxTokens: number): Promise<string> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature,
                        maxOutputTokens: maxTokens
                    }
                })
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`HTTP ${res.status}: ${errBody}`);
            }

            const data = (await res.json()) as any;
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Formato de resposta inesperado do Gemini");
            }
            return text;
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Calls Hugging Face Serverless Inference API
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
     * Sliding window rate limiter for Gemini RPM quota.
     */
    private checkAndRecordRateLimit(): boolean {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Filter out timestamps older than 1 minute
        this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);

        if (this.requestTimestamps.length >= this.geminiMaxRpm) {
            return false;
        }

        this.requestTimestamps.push(now);
        return true;
    }

    /**
     * Returns real-time health and telemetry metrics for the Dual-API engine.
     */
    public getHealthStatus(): {
        activeProvider: string;
        geminiConfigured: boolean;
        huggingFaceConfigured: boolean;
        requestsInLastMinute: number;
        lastSwitchReason: string;
    } {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const currentRpm = this.requestTimestamps.filter(t => t > oneMinuteAgo).length;

        return {
            activeProvider: this.activeProvider,
            geminiConfigured: this.geminiApiKey.length > 0,
            huggingFaceConfigured: this.huggingFaceApiKey.length > 0,
            requestsInLastMinute: currentRpm,
            lastSwitchReason: this.lastSwitchReason
        };
    }
}
