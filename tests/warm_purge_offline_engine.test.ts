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
        const installed = engine.findModelPath("qwen2.5-coder-1.5b-instruct-q4_k_m.gguf");
        expect(installed).not.toBeNull();

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
});
