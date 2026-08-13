import { describe, it, expect } from "bun:test";
import { EnvGate, ENV_GATE } from "./env_gate.ts";

describe("EnvGate Test Suite", () => {
    it("should export ENV_GATE and EnvGate configuration object", () => {
        expect(EnvGate).toBeDefined();
        expect(ENV_GATE).toBeDefined();
        expect(EnvGate.HUB_GRPC_HOST).toBeDefined();
    });

    it("should retrieve default ports correctly", () => {
        expect(typeof EnvGate.DASHBOARD_DEV_PORT).toBe("number");
        expect(EnvGate.DASHBOARD_DEV_PORT).toBe(5173);
    });
});
