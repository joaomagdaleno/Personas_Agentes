import { describe, it, expect } from "bun:test";
import {
    SysPerfArchitectService,
    SovereigntyLogger,
    ResourceGovernorStrategy
} from "./sys_perf_architect_service.ts";

describe("SysPerfArchitectService Deep Test Suite", () => {
    it("should instantiate SysPerfArchitectService correctly", () => {
        const service = new SysPerfArchitectService();
        expect(service).toBeDefined();
    });

    it("should obtain singleton instance of SovereigntyLogger", () => {
        const logger1 = SovereigntyLogger.getInstance();
        const logger2 = SovereigntyLogger.getInstance();
        expect(logger1).toBe(logger2);
    });

    it("should accurately evaluate resource throttling condition", () => {
        const lowLoadHealth = { cpu_usage: 20, memory_usage: 40 };
        const highLoadHealth = { cpu_usage: 95, memory_usage: 98 };

        expect(ResourceGovernorStrategy.shouldThrottle(lowLoadHealth)).toBe(false);
        expect(ResourceGovernorStrategy.shouldThrottle(highLoadHealth)).toBe(true);
    });
});
