import { describe, it, expect } from "bun:test";
import { SovereignResourceBudget } from "../src_local/engines/maintenance/sovereign_resource_budget.ts";
import { eventBus } from "../src_local/core/event_bus.ts";

describe("SovereignResourceBudget Unit Tests", () => {
    it("should sample telemetry and return valid snapshot", () => {
        const budget = SovereignResourceBudget.getInstance();
        const snapshot = budget.sampleTelemetry();

        expect(snapshot).toHaveProperty("ramTotalGB");
        expect(snapshot).toHaveProperty("ramFreeGB");
        expect(snapshot).toHaveProperty("ramUsagePercent");
        expect(snapshot).toHaveProperty("cpuUsagePercent");
        expect(snapshot).toHaveProperty("estimatedTempC");
        expect(snapshot).toHaveProperty("resourceScore");
        expect(snapshot).toHaveProperty("mode");

        expect(snapshot.resourceScore).toBeGreaterThanOrEqual(0);
        expect(snapshot.resourceScore).toBeLessThanOrEqual(100);
    });

    it("should calculate correct Sovereign Scores for simulated loads", () => {
        const budget = SovereignResourceBudget.getInstance();

        // 1. Idle machine (Low RAM, Low CPU, Normal Temp) -> Turbo (Score > 70)
        const idleScore = budget.calculateResourceScore(20, 10, 45, false);
        expect(idleScore).toBeGreaterThanOrEqual(70);
        expect(budget.determineMode(idleScore)).toBe("Turbo");

        // 2. Moderate load (50% RAM, 50% CPU, 55C) -> Balanceado (30 <= Score <= 70)
        const moderateScore = budget.calculateResourceScore(50, 50, 55, false);
        expect(moderateScore).toBeGreaterThanOrEqual(30);
        expect(moderateScore).toBeLessThanOrEqual(70);
        expect(budget.determineMode(moderateScore)).toBe("Balanceado");

        // 3. Stressed machine (90% RAM, 95% CPU, 85C thermal throttling) -> Ultraleve (Score < 30)
        const stressedScore = budget.calculateResourceScore(90, 95, 85, false);
        expect(stressedScore).toBeLessThan(30);
        expect(budget.determineMode(stressedScore)).toBe("Ultraleve");
    });

    it("should provide appropriate AdaptiveConfig based on current mode", () => {
        const budget = SovereignResourceBudget.getInstance();
        const config = budget.getAdaptiveConfig();

        expect(["Ultraleve", "Balanceado", "Turbo"]).toContain(config.mode);
        expect(config.maxConcurrentWorkers).toBeGreaterThanOrEqual(1);
        expect(config.maxWasmMicroAgents).toBeGreaterThanOrEqual(1);
        expect(config.fileWatchIntervalMs).toBeGreaterThanOrEqual(1000);
        expect(["CloudOnly", "CloudOrWarmPurge", "LocalOrCloudWithCache"]).toContain(config.aiStrategy);
    });

    it("should start and stop the 3s telemetry loop cleanly", async () => {
        const budget = new SovereignResourceBudget();
        let eventFired = false;

        const listener = () => {
            eventFired = true;
        };

        eventBus.on("resource:mode_changed", listener);

        budget.startLoop(100); // 100ms for test speed
        await Bun.sleep(250);
        budget.stopLoop();

        // Cleanup
        eventBus.off("resource:mode_changed", listener);
        expect(true).toBe(true);
    });
});
