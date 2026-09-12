import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { LocalSLMEngine } from "../src_local/utils/ai/local_slm_engine.ts";
import { WarmPurgeOfflineEngine } from "../src_local/utils/ai/warm_purge_offline_engine.ts";

describe("LocalSLMEngine Unit Tests", () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        originalFetch = global.fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it("should execute prompt via primary local SLM engine (WarmPurge)", async () => {
        // Arrange - Component: LocalSLMEngine (Primary Local SLM) | Pattern: AAA
        const engine = new LocalSLMEngine({
            modelName: "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf"
        });
        const offlineEngine = WarmPurgeOfflineEngine.getInstance();
        const generateSpy = spyOn(offlineEngine, "generate").mockResolvedValue("Resposta local gerada com sucesso.");

        // Act
        const response = await engine.generate("Prompt de teste local");

        // Assert
        expect(response.provider).toBe("local-slm");
        expect(response.text).toBe("Resposta local gerada com sucesso.");
        expect(response.fallbackTriggered).toBe(false);
        expect(response.latencyMs).toBeGreaterThanOrEqual(0);
        expect(generateSpy).toHaveBeenCalled();

        generateSpy.mockRestore();
    });

    it("should fail over to Hugging Face Serverless API when primary local engine throws an error", async () => {
        // Arrange - Component: LocalSLMEngine (HuggingFace Failover) | Pattern: AAA
        const engine = new LocalSLMEngine({
            modelName: "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
            huggingFaceApiKey: "hf_valid_test_token_1234567890",
            huggingFaceModel: "Qwen/Qwen2.5-Coder-7B-Instruct"
        });

        const offlineEngine = WarmPurgeOfflineEngine.getInstance();
        const generateSpy = spyOn(offlineEngine, "generate").mockRejectedValue(new Error("Local SLM crash"));

        global.fetch = (async (url: string | URL | Request) => {
            if (url.toString().includes("huggingface.co")) {
                return new Response(JSON.stringify([{ generated_text: "Resposta gerada pela Hugging Face." }]), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }
            return new Response("Not Found", { status: 404 });
        }) as typeof global.fetch;

        // Act
        const response = await engine.generate("Prompt de teste failover HF");

        // Assert
        expect(response.provider).toBe("huggingface");
        expect(response.text).toBe("Resposta gerada pela Hugging Face.");
        expect(response.fallbackTriggered).toBe(true);
        expect(response.model).toBe("Qwen/Qwen2.5-Coder-7B-Instruct");

        generateSpy.mockRestore();
    });

    it("should fall back gracefully to static fallback when both local engine and Hugging Face fail", async () => {
        // Arrange - Component: LocalSLMEngine (Static Fallback) | Pattern: AAA
        const engine = new LocalSLMEngine({
            modelName: "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
            huggingFaceApiKey: "hf_valid_test_token_1234567890"
        });

        const offlineEngine = WarmPurgeOfflineEngine.getInstance();
        const generateSpy = spyOn(offlineEngine, "generate").mockRejectedValue(new Error("Local SLM down"));

        global.fetch = (async () => {
            return new Response("HTTP 500 Internal Server Error", { status: 500 });
        }) as typeof global.fetch;

        // Act
        const response = await engine.generate("Prompt de teste fallback estatico");

        // Assert
        expect(response.provider).toBe("fallback");
        expect(response.text).toBe("");
        expect(response.fallbackTriggered).toBe(true);
        expect(response.model).toBe("static-fallback");

        generateSpy.mockRestore();
    });

    it("should return accurate health and telemetry status from getHealthStatus()", () => {
        // Arrange - Component: LocalSLMEngine (Health Telemetry) | Pattern: AAA
        const engine = new LocalSLMEngine({
            modelName: "custom-test-model.gguf",
            huggingFaceApiKey: "hf_valid_test_token_1234567890"
        });

        // Act
        const health = engine.getHealthStatus();

        // Assert
        expect(health.localSlmConfigured).toBe(true);
        expect(health.geminiConfigured).toBe(false);
        expect(health.huggingFaceConfigured).toBe(true);
        expect(health.modelName).toBe("custom-test-model.gguf");
        expect(health.activeProvider).toBe("local-slm");
    });
});
