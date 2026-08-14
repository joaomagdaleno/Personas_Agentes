import { describe, it, expect, afterAll } from "bun:test";
import { ZigFileWatcherBridge } from "../src_local/utils/zig/zig_file_watcher_bridge.ts";
import { SovereignResourceBudget } from "../src_local/engines/maintenance/sovereign_resource_budget.ts";
import { eventBus } from "../src_local/core/event_bus.ts";

describe("ZigFileWatcherBridge Unit Tests", () => {
    afterAll(() => {
        const watcher = ZigFileWatcherBridge.getInstance();
        watcher.release();
    });

    it("should instantiate ZigFileWatcherBridge with standard parameters", () => {
        const watcher = ZigFileWatcherBridge.getInstance();
        expect(watcher).toBeDefined();
        expect(typeof watcher.isNativeWatcherAvailable()).toBe("boolean");
    });

    it("should start and stop file watcher cleanly", () => {
        const watcher = ZigFileWatcherBridge.getInstance();
        const started = watcher.startWatcher("/app/src_local");

        expect(started).toBe(true);

        // Try to start twice should fail or be gracefully ignored
        const startedTwice = watcher.startWatcher("/app/src_local");
        expect(startedTwice).toBe(false);

        watcher.stopWatcher();
    });

    it("should report rigid memory footprint under 3MB RAM", () => {
        const watcher = ZigFileWatcherBridge.getInstance();
        const bytes = watcher.getMemoryBytes();

        expect(bytes).toBeGreaterThan(0);
        // Under 3MB (3,145,728 bytes)
        expect(bytes).toBeLessThan(3 * 1024 * 1024);
    });

    it("should simulate file change and poll events from ring buffer", () => {
        const watcher = ZigFileWatcherBridge.getInstance();
        watcher.startWatcher("/app/src_local");

        watcher.simulateFileChange("src_local/core/orchestrator.ts");
        watcher.simulateFileChange("src_local/utils/ai/wasm_micro_agent_runtime.ts");

        const events = watcher.pollEvents();
        expect(events.length).toBe(2);
        expect(events).toContain("src_local/core/orchestrator.ts");
        expect(events).toContain("src_local/utils/ai/wasm_micro_agent_runtime.ts");

        // Subsequent poll should be empty (purged/drained)
        const emptyEvents = watcher.pollEvents();
        expect(emptyEvents.length).toBe(0);

        watcher.stopWatcher();
    });

    it("should react to SovereignResourceBudget mode changes and adjust throttle", async () => {
        const watcher = ZigFileWatcherBridge.getInstance();
        const budget = SovereignResourceBudget.getInstance();

        watcher.startWatcher("/app/src_local");

        // Initially configured with default budget interval
        const initialInterval = watcher.getWatchInterval();
        expect(initialInterval).toBeGreaterThanOrEqual(1000);

        // Simulate ResourceBudget changing mode to Ultraleve (Score < 30) -> 10,000 ms (10s)
        eventBus.emit("resource:mode_changed", {
            mode: "Ultraleve",
            score: 15,
            config: {
                mode: "Ultraleve",
                resourceScore: 15,
                maxConcurrentWorkers: 1,
                maxWasmMicroAgents: 1,
                fileWatchIntervalMs: 10000,
                aiStrategy: "CloudOnly"
            }
        });

        expect(watcher.getWatchInterval()).toBe(10000);

        // Simulate ResourceBudget changing mode to Turbo (Score > 70) -> 1,000 ms (1s)
        eventBus.emit("resource:mode_changed", {
            mode: "Turbo",
            score: 85,
            config: {
                mode: "Turbo",
                resourceScore: 85,
                maxConcurrentWorkers: 8,
                maxWasmMicroAgents: 8,
                fileWatchIntervalMs: 1000,
                aiStrategy: "LocalOrCloudWithCache"
            }
        });

        expect(watcher.getWatchInterval()).toBe(1000);

        watcher.stopWatcher();
    });
});
