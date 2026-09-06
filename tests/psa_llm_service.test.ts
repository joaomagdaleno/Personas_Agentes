import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaLLMService, type PsaModelDefinition, type PsaStreamChunk } from "../src_local/psa/llm/psa_llm_service.ts";

describe("PsaLLMService Unit Tests", () => {
    let ctx: PsaContext;
    let llmService: PsaLLMService;

    beforeEach(() => {
        ctx = new PsaContext();
        llmService = ctx.llm;
    });

    describe("Model Registration & Discovery", () => {
        it("should initialize with default registered models and aliases", () => {
            const models = llmService.list();
            expect(models.length).toBeGreaterThanOrEqual(5);

            const ids = models.map(m => m.id);
            expect(ids).toContain("qwen2.5-coder-1.5b");
            expect(ids).toContain("qwen3-8b-thinking");
            expect(ids).toContain("qwen2.5-coder-7b");
            expect(ids).toContain("deepseek-v4-flash");
            expect(ids).toContain("deepseek-v4-pro");
        });

        it("should retrieve model by exact ID using get and getModel", () => {
            const model1 = llmService.get("qwen2.5-coder-1.5b");
            const model2 = llmService.getModel("qwen2.5-coder-1.5b");

            expect(model1).toBeDefined();
            expect(model1?.name).toContain("Qwen 2.5 Coder 1.5B");
            expect(model1?.provider).toBe("local");
            expect(model1?.contextWindow).toBe(32768);
            expect(model2).toEqual(model1);
        });

        it("should allow registering and retrieving custom model definitions", () => {
            const customModel: PsaModelDefinition = {
                id: "custom-slm-3b",
                name: "Custom SLM 3B Model",
                provider: "local",
                supportsDeepThink: true,
                supportsReasoning: true,
                contextWindow: 65536,
                maxTokens: 4096
            };

            llmService.register(customModel);

            const retrieved = llmService.get("custom-slm-3b");
            expect(retrieved).toBeDefined();
            expect(retrieved?.id).toBe("custom-slm-3b");
            expect(retrieved?.supportsDeepThink).toBe(true);
            expect(llmService.list().some(m => m.id === "custom-slm-3b")).toBe(true);
        });

        it("should return undefined for non-existent model ID", () => {
            const result = llmService.get("unknown-model-xyz");
            expect(result).toBeUndefined();
        });
    });

    describe("Stream Inference Execution", () => {
        it("should stream inference chunks for default local 1.5B model", async () => {
            const chunks: PsaStreamChunk[] = [];

            for await (const chunk of llmService.streamInference({
                model: "qwen2.5-coder-1.5b",
                prompt: "Responda apenas com 'PING'."
            })) {
                chunks.push(chunk);
            }

            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks.some(c => c.type === "text")).toBe(true);
            const combinedContent = chunks.map(c => c.content).join("");
            expect(combinedContent.length).toBeGreaterThan(0);
        });

        it("should handle deepthink mode flag and stream reasoning or text content", async () => {
            const chunks: PsaStreamChunk[] = [];

            for await (const chunk of llmService.streamInference({
                model: "qwen3-8b-thinking",
                prompt: "Planeje uma arquitetura de microserviços.",
                deepthink: true
            })) {
                chunks.push(chunk);
            }

            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks.every(c => c.type === "text" || c.type === "reasoning" || c.type === "error")).toBe(true);
        });

        it("should fall back gracefully to default model when target model is not found in map", async () => {
            const chunks: PsaStreamChunk[] = [];

            for await (const chunk of llmService.streamInference({
                model: "unregistered-fallback-model",
                prompt: "Teste de resiliência de modelo inexistente."
            })) {
                chunks.push(chunk);
            }

            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks.some(c => c.type === "text")).toBe(true);
        });

        it("should accept system prompt parameter and process stream without throwing", async () => {
            const chunks: PsaStreamChunk[] = [];

            for await (const chunk of llmService.streamInference({
                model: "qwen2.5-coder-7b",
                prompt: "Analise a função principal.",
                systemPrompt: "Você é um auditor de segurança especializado em Rust e C++."
            })) {
                chunks.push(chunk);
            }

            expect(chunks.length).toBeGreaterThan(0);
            expect(chunks.some(c => c.type === "text")).toBe(true);
        });
    });
});
