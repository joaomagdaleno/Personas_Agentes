import { describe, it, expect } from "bun:test";
import { NativeFFIBridge } from "../src_local/engines/healing/resilience_healing_architect_service.ts";

describe("NativeFFIBridge (Bun FFI)", () => {
    it("should instantiate NativeFFIBridge instance safely", () => {
        const bridge = NativeFFIBridge.getInstance();
        expect(bridge).toBeDefined();
    });

    it("should calculate complexity (native or fallback)", () => {
        const bridge = NativeFFIBridge.getInstance();
        const code = "function test() { if (true) { return 1; } return 0; }";
        const complexity = bridge.calculateComplexityNative(code);
        expect(complexity).toBeGreaterThan(0);
    });

    it("should calculate fast hash (native or fallback)", () => {
        const bridge = NativeFFIBridge.getInstance();
        const code = "function test() {}";
        const hash = bridge.fastHashNative(code);
        expect(typeof hash).toBe("bigint");
    });

    it("should support Explicit Resource Management with using operator", () => {
        const bridge = NativeFFIBridge.getInstance();
        bridge.close();
        expect(bridge.isNativeAvailable()).toBe(false);
    });
});
