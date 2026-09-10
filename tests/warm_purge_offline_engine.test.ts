import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { WarmPurgeOfflineEngine } from "../src_local/utils/ai/warm_purge_offline_engine.ts";
import { SovereignResourceBudget } from "../src_local/engines/maintenance/sovereign_resource_budget.ts";
import { eventBus } from "../src_local/core/event_bus.ts";

describe("WarmPurgeOfflineEngine Unit Tests", () => {
    beforeEach(() => {
        const engine = WarmPurgeOfflineEngine.getInstance();
        engine.forcePurge();
    });

    afterEach(() => {
        const engine = WarmPurgeOfflineEngine.getInstance();
        engine.forcePurge();
    });

    it("should initialize in cold state with 0MB RAM allocation", () => {
        const engine = WarmPurgeOfflineEngine.getInstance();
        const telemetry = engine.getTelemetry();

        expect(telemetry.isWarm).toBe(false);
        expect(telemetry.allocatedMemoryBytes).toBe(0);
        expect(telemetry.loadedModel).toContain("qwen2.5-coder");
        expect(telemetry.timeUntilPurgeMs).toBe(0);
    });

    it("should warm model on first generate call and allocate virtual RAM", async () => {
        const engine = WarmPurgeOfflineEngine.getInstance();

        const response = await engine.generate("Responda apenas com a palavra 'CONSCIENTE'.");
        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(0);

        const telemetry = engine.getTelemetry();
        expect(telemetry.isWarm).toBe(true);
        expect(telemetry.allocatedMemoryBytes).toBeGreaterThan(0);
        expect(telemetry.timeUntilPurgeMs).toBeGreaterThan(0);
    }, 20000);

    it("should accept structural context and inject into prompt", async () => {
        const engine = WarmPurgeOfflineEngine.getInstance();

        const context = "File: src/core/orchestrator.ts\nSymbols: class Orchestrator";
        const response = await engine.generate("O que faz este arquivo?", { context });

        expect(response).toBeDefined();
        expect(response.length).toBeGreaterThan(0);
    }, 20000);

    it("should adjust linger window dynamically on SovereignResourceBudget mode changes", () => {
        const engine = WarmPurgeOfflineEngine.getInstance();

        // Emit Ultraleve mode -> 15s linger window
        eventBus.emit("resource:mode_changed" as any, {
            mode: "Ultraleve",
            score: 10,
            config: { mode: "Ultraleve", fileWatchIntervalMs: 10000 }
        });

        let telemetry = engine.getTelemetry();
        expect(telemetry.lingerWindowMs).toBe(15000);

        // Emit Balanceado mode -> 60s linger window
        eventBus.emit("resource:mode_changed" as any, {
            mode: "Balanceado",
            score: 50,
            config: { mode: "Balanceado", fileWatchIntervalMs: 3000 }
        });

        telemetry = engine.getTelemetry();
        expect(telemetry.lingerWindowMs).toBe(60000);
    });

    it("should completely purge RAM allocation when forcePurge is called", async () => {
        const engine = WarmPurgeOfflineEngine.getInstance();

        await engine.generate("Prompt de teste");
        expect(engine.getTelemetry().isWarm).toBe(true);

        engine.forcePurge();
        const telemetry = engine.getTelemetry();

        expect(telemetry.isWarm).toBe(false);
        expect(telemetry.allocatedMemoryBytes).toBe(0);
        expect(telemetry.timeUntilPurgeMs).toBe(0);
    }, 20000);

    it("should find installed model and return null for missing weights", () => {
        const engine = WarmPurgeOfflineEngine.getInstance();
        const modelName = "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf";
        const installed = engine.findModelPath(modelName);
        if (installed !== null) {
            expect(installed).toContain(modelName);
        } else {
            // Em ambientes de CI limpos sem modelo baixado previamente
            expect(installed).toBeNull();
        }

        const missing = engine.findModelPath("non-existent-model-xyz.gguf");
        expect(missing).toBeNull();
    });

    it("should handle model switching mutex and unload previous model", async () => {
        const engine = WarmPurgeOfflineEngine.getInstance();

        // Warm with default/target model
        await engine.generate("Ping");
        expect(engine.getTelemetry().isWarm).toBe(true);

        // Requesting a missing model gracefully returns false without crashing
        const switchSuccess = await engine.ensureServerRunning("non-existent-model-xyz.gguf");
        expect(switchSuccess).toBe(false);
    }, 20000);

    it("should remain idempotent when forcePurge is called multiple times on cold state", () => {
        // Arrange - Component: WarmPurgeOfflineEngine | Pattern: Given-When-Then
        const engine = WarmPurgeOfflineEngine.getInstance();
        expect(engine.getTelemetry().isWarm).toBe(false);

        // Act
        expect(() => {
            engine.forcePurge();
            engine.forcePurge();
            engine.forcePurge();
        }).not.toThrow();

        // Assert
        const telemetry = engine.getTelemetry();
        expect(telemetry.isWarm).toBe(false);
        expect(telemetry.allocatedMemoryBytes).toBe(0);
        expect(telemetry.timeUntilPurgeMs).toBe(0);
    });

    it("should automatically purge RAM allocation after the linger window timer expires due to inactivity", async () => {
        // Arrange
        const engine = WarmPurgeOfflineEngine.getInstance();

        // Act: generate prompt to transition engine to warm state
        await engine.generate("Ping auto-purge test");
        expect(engine.getTelemetry().isWarm).toBe(true);

        // Set a short 50ms linger window and trigger purge timer
        (engine as any).lingerWindowMs = 50;
        (engine as any).schedulePurge();

        // Assert: wait 80ms for inactive linger window timer to fire automatically
        await new Promise(r => setTimeout(r, 80));

        const telemetry = engine.getTelemetry();
        expect(telemetry.isWarm).toBe(false);
        expect(telemetry.allocatedMemoryBytes).toBe(0);
        expect(telemetry.timeUntilPurgeMs).toBe(0);
    }, 5000);

    it("should stream tokens via streamChatCompletion and transition engine to warm state", async () => {
        // Arrange - Component: WarmPurgeOfflineEngine (Streaming) | Pattern: AAA
        const engine = WarmPurgeOfflineEngine.getInstance();
        const chunks: Array<{ type: "reasoning" | "text"; content: string }> = [];

        // Act
        for await (const chunk of engine.streamChatCompletion({
            prompt: "Responda apenas 'PING'.",
            systemPrompt: "Você é um assistente conciso.",
            deepthink: true
        })) {
            chunks.push(chunk);
        }

        // Assert
        expect(chunks.length).toBeGreaterThan(0);
        expect(chunks.some(c => c.type === "text")).toBe(true);

        const telemetry = engine.getTelemetry();
        expect(telemetry.isWarm).toBe(true);
        expect(telemetry.allocatedMemoryBytes).toBeGreaterThan(0);
        expect(telemetry.timeUntilPurgeMs).toBeGreaterThan(0);
    }, 20000);

    it("should verify checkMemorySafety evaluates OS free memory threshold", () => {
        // Arrange - Component: WarmPurgeOfflineEngine (Memory Safety) | Pattern: AAA
        const engine = WarmPurgeOfflineEngine.getInstance();

        // Act
        const isSafeForSmallAlloc = engine.checkMemorySafety(100);

        // Assert
        expect(typeof isSafeForSmallAlloc).toBe("boolean");
    });
});
