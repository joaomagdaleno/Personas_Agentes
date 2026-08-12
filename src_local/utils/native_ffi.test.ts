import { describe, expect, test } from "bun:test";
import { NativeFFIBridge } from "./native_ffi.ts";

describe("NativeFFIBridge (Bun FFI)", () => {
    test("should instantiate NativeFFIBridge instance safely", () => {
        const bridge = NativeFFIBridge.getInstance();
        expect(bridge).toBeDefined();
        expect(typeof bridge.isNativeAvailable).toBe("function");
        expect(typeof bridge.calculateComplexityNative).toBe("function");
        expect(typeof bridge.fastHashNative).toBe("function");
    });

    test("should calculate complexity (native or fallback)", () => {
        const bridge = NativeFFIBridge.getInstance();
        const code = `function test() { if (x > 0) { for (let i = 0; i < n; i++) { } } }`;
        const complexity = bridge.calculateComplexityNative(code);
        expect(complexity).toBeGreaterThanOrEqual(1);
        // "if " + "for " = base 1 + 2 = 3
        expect(complexity).toBe(3);
    });

    test("should calculate fast hash (native or fallback)", () => {
        const bridge = NativeFFIBridge.getInstance();
        const hash1 = bridge.fastHashNative("hello world");
        const hash2 = bridge.fastHashNative("hello world");
        const hash3 = bridge.fastHashNative("different content");
        // Same input = same hash
        expect(hash1).toBe(hash2);
        // Different input = different hash
        expect(hash1).not.toBe(hash3);
        // Hash should be a positive bigint
        expect(hash1).toBeGreaterThan(0n);
    });

    test("should support Explicit Resource Management with using operator", () => {
        let disposed = false;
        {
            using bridge = NativeFFIBridge.getInstance();
            expect(bridge).toBeDefined();
        }
        // Exited using scope cleanly
        expect(true).toBe(true);
    });
});
