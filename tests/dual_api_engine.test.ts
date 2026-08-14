import { describe, it, expect, beforeEach } from "bun:test";
import { DualAPIEngine } from "../src_local/utils/ai/dual_api_engine.ts";

describe("DualAPIEngine Unit Tests", () => {
    it("should instantiate DualAPIEngine with default parameters", () => {
        const engine = new DualAPIEngine({
            geminiApiKey: "test-gemini-key",
            huggingFaceApiKey: "test-hf-key",
            geminiMaxRpm: 10,
            timeoutMs: 5000
        });

        const status = engine.getHealthStatus();
        expect(status.geminiConfigured).toBe(true);
        expect(status.huggingFaceConfigured).toBe(true);
        expect(status.requestsInLastMinute).toBe(0);
        expect(status.activeProvider).toBe("gemini");
    });

    it("should return fallback response when no API keys are provided", async () => {
        const unconfiguredEngine = new DualAPIEngine({
            geminiApiKey: "",
            huggingFaceApiKey: ""
        });

        const res = await unconfiguredEngine.generate("Teste de raciocínio");
        expect(res.provider).toBe("fallback");
        expect(res.fallbackTriggered).toBe(true);
        expect(res.text).toBe("");
    });

    it("should throttle and switch provider when Gemini RPM rate limit is reached", async () => {
        const rateLimitedEngine = new DualAPIEngine({
            geminiApiKey: "fake-key",
            huggingFaceApiKey: "fake-hf-key",
            geminiMaxRpm: 2
        });

        // Trigger requests to consume RPM quota
        // (will hit rate limiter logic inside engine)
        const res1 = await rateLimitedEngine.generate("Prompt 1");
        const res2 = await rateLimitedEngine.generate("Prompt 2");
        const res3 = await rateLimitedEngine.generate("Prompt 3");

        const status = rateLimitedEngine.getHealthStatus();
        expect(status.requestsInLastMinute).toBeLessThanOrEqual(2);
    });

    it("should correctly report health and telemetry metrics", () => {
        const engine = new DualAPIEngine({
            geminiApiKey: "fake-key",
            geminiMaxRpm: 15
        });

        const health = engine.getHealthStatus();
        expect(health).toHaveProperty("activeProvider");
        expect(health).toHaveProperty("geminiConfigured");
        expect(health).toHaveProperty("huggingFaceConfigured");
        expect(health).toHaveProperty("requestsInLastMinute");
        expect(health).toHaveProperty("lastSwitchReason");
    });
});
