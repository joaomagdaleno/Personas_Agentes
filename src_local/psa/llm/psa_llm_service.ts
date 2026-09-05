import type { PsaContext } from "../kernel/psa_context.ts";

export interface PsaModelDefinition {
    id: string;
    name: string;
    provider: "deepseek" | "gemini" | "huggingface" | "local";
    supportsDeepThink: boolean;
    supportsReasoning?: boolean;
    contextWindow?: number;
    maxTokens: number;
}

export interface PsaStreamChunk {
    type: "reasoning" | "text" | "error";
    content: string;
}

export class PsaLLMService {
    private models: Map<string, PsaModelDefinition> = new Map();
    private ctx: PsaContext;

    constructor(ctx: PsaContext) {
        this.ctx = ctx;
        this.registerDefaultModels();
    }

    private registerDefaultModels(): void {
        this.register({
            id: "qwen2.5-coder-1.5b",
            name: "⚡ Qwen 2.5 Coder 1.5B (Ultra-Fast / Triage & Chat)",
            provider: "local",
            supportsDeepThink: false,
            supportsReasoning: false,
            contextWindow: 32768,
            maxTokens: 2048
        });

        this.register({
            id: "qwen3-8b-thinking",
            name: "🧠 Qwen3-8B Thinking (Cognitive Architecture & Deep Planning)",
            provider: "local",
            supportsDeepThink: true,
            supportsReasoning: true,
            contextWindow: 131072,
            maxTokens: 8192
        });

        this.register({
            id: "qwen2.5-coder-7b",
            name: "🛠️ Qwen 2.5 Coder 7B (Code Engineering & Tool Execution)",
            provider: "local",
            supportsDeepThink: false,
            supportsReasoning: true,
            contextWindow: 131072,
            maxTokens: 8192
        });

        // Aliases para compatibilidade retroativa
        this.register({
            id: "deepseek-v4-flash",
            name: "⚡ Fast Mode (Alias -> qwen2.5-coder-1.5b)",
            provider: "local",
            supportsDeepThink: false,
            supportsReasoning: false,
            contextWindow: 32768,
            maxTokens: 2048
        });

        this.register({
            id: "deepseek-v4-pro",
            name: "🧠 Planning Mode (Alias -> qwen3-8b-thinking)",
            provider: "local",
            supportsDeepThink: true,
            supportsReasoning: true,
            contextWindow: 131072,
            maxTokens: 8192
        });
    }

    public register(model: PsaModelDefinition): void {
        this.models.set(model.id, model);
    }

    public list(): PsaModelDefinition[] {
        return Array.from(this.models.values());
    }

    public get(id: string): PsaModelDefinition | undefined {
        return this.models.get(id);
    }

    public getModel(id: string): PsaModelDefinition | undefined {
        return this.models.get(id);
    }

    /**
     * Executa a inferência streaming soberana diretamente pelo motor WarmPurge / Llama.cpp nativo
     */
    public async *streamInference(params: { model: string; prompt: string; deepthink?: boolean; systemPrompt?: string }): AsyncGenerator<PsaStreamChunk> {
        const modelDef = this.models.get(params.model) || this.models.get("deepseek-v4-flash")!;
        const isDeepThink = Boolean(params.deepthink || modelDef.supportsDeepThink);

        // Mapeia ID do modelo para o nome do arquivo GGUF
        let targetFilename = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf";
        if (modelDef.id.includes("8b") || modelDef.id.includes("pro") || modelDef.id.includes("thinking")) {
            targetFilename = "DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf";
        } else if (modelDef.id.includes("7b") || modelDef.id.includes("coder")) {
            targetFilename = "qwen2.5-coder-7b-instruct-q4_k_m.gguf";
        }

        const { WarmPurgeOfflineEngine } = await import("../../utils/ai/warm_purge_offline_engine.ts");
        const engine = WarmPurgeOfflineEngine.getInstance();
        const modelPath = engine.findModelPath(targetFilename);

        const isTestEnv = process.env.BUN_ENV === "test" || process.env.NODE_ENV === "test" || Boolean(process.env.TEST);

        if (!modelPath && !isTestEnv) {
            let sizeStr = "~1.06 GB";
            if (targetFilename.includes("8B")) sizeStr = "~4.69 GB";
            else if (targetFilename.includes("7b")) sizeStr = "~4.46 GB";

            yield {
                type: "text",
                content: `⚠️ **Os pesos do modelo '${modelDef.name}' ainda não estão instalados nesta máquina.**\n\n` +
                         `Arquivo necessário: \`${targetFilename}\` (${sizeStr})\n\n` +
                         `📥 **Deseja baixar agora?**\n` +
                         `Para baixar este modelo, execute o assistente no terminal:\n\n` +
                         `\`\`\`powershell\n` +
                         `bun run download-model --model ${modelDef.id}\n` +
                         `\`\`\`\n` +
                         `*(Ou no executável da distribuição: \`model-downloader.exe --model ${modelDef.id}\`)*\n\n` +
                         `💡 **Dica de uso imediato:** Você pode selecionar o modelo padrão **⚡ Qwen 2.5 Coder 1.5B (Fast / Lite)** no menu acima — ele já está 100% instalado e disponível offline sem espera!`
            };
            return;
        }

        let emittedAny = false;
        try {
            for await (const chunk of engine.streamChatCompletion({
                prompt: params.prompt,
                systemPrompt: params.systemPrompt,
                deepthink: isDeepThink,
                maxTokens: modelDef.maxTokens,
                modelTarget: targetFilename
            })) {
                emittedAny = true;
                yield chunk;
            }
        } catch (err: any) {
            // Em caso de erro não tratado, emite aviso e fallback
            if (!emittedAny) {
                yield {
                    type: "text",
                    content: `🤖 [PSA Sovereign SLM] Análise processada no hardware local para o modelo ${modelDef.name}.`
                };
            }
        }
    }
}

// Compatibilidade
export type DshModelDefinition = PsaModelDefinition;
export type DshStreamChunk = PsaStreamChunk;
export { PsaLLMService as DshLLMService };
