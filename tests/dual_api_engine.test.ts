import { describe, it, expect } from "bun:test";
import { DualAPIEngine, LocalSLMEngine } from "../src_local/utils/ai/dual_api_engine.ts";

describe("LocalSLMEngine & DualAPIEngine Unit Tests (Sovereign Local Mode)", () => {
    it("should instantiate LocalSLMEngine with zero Google API dependencies", () => {
        const engine = new LocalSLMEngine({
            modelName: "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
            timeoutMs: 5000
        });

        const status = engine.getHealthStatus();
        expect(status.localSlmConfigured).toBe(true);
        expect(status.geminiConfigured).toBe(false); // Eliminado do sistema
        expect(status.activeProvider).toBe("local-slm");
        expect(status.modelName).toBe("qwen2.5-coder-1.5b-instruct-q4_k_m.gguf");
    });

    it("should generate deterministic response offline via local engine fallback", async () => {
        const engine = new LocalSLMEngine();
        const res = await engine.generate("RESPONDA APENAS 'OK'");
        expect(["local-slm", "fallback"]).toContain(res.provider);
        expect(res.text).toBe("OK");
    });

    it("should respond to ping / conscient status in offline mode", async () => {
        const engine = new LocalSLMEngine();
        const res = await engine.generate("ESTOU CONSCIENTE?");
        expect(res.text).toContain("CONSCIENTE");
    });

    it("should ensure DualAPIEngine operates in sovereign mode with no Gemini", () => {
        const dualEngine = new DualAPIEngine();
        const health = dualEngine.getHealthStatus();
        expect(health.geminiConfigured).toBe(false); // Google Gemini desativado/eliminado
        expect(health.localSlmConfigured).toBe(true);
        expect(health).toHaveProperty("activeProvider");
        expect(health).toHaveProperty("lastSwitchReason");
    });
});
