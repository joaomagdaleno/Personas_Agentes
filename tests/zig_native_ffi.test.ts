import { describe, it, expect } from "bun:test";
import { NativeFFIBridge } from "../src_local/engines/healing/resilience_healing_architect_service.ts";
import { TestRunner } from "../src_local/engines/automation/test_runner.ts";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Zig Native FFI & TestRunner Integration", () => {
    it("should resolve and load the compiled Zig dynamic library", () => {
        const bridge = NativeFFIBridge.getInstance();
        expect(bridge.isZigNativeAvailable()).toBe(true);
    });

    it("should calculate correct entropy for standard strings using Zig", () => {
        const bridge = NativeFFIBridge.getInstance();

        // High entropy string (looks like a key)
        const secret = "4f8a9e7b2c6d1a0e3f5b7c9d8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b";
        const secretEntropy = bridge.calculateEntropy(secret);

        // Low entropy string (repeated char)
        const flat = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const flatEntropy = bridge.calculateEntropy(flat);

        expect(secretEntropy).toBeGreaterThan(flatEntropy);
        expect(flatEntropy).toBe(0.0);
    });

    it("should identify unsafe patterns using Zig native pattern matcher", () => {
        const bridge = NativeFFIBridge.getInstance();

        const safeCode = "const x = 42;\nstd.debug.print(\"value: {d}\\n\", .{x});";
        const unsafeCode = "fn run() void {\n    // Critical security vulnerability\n    _ = system(\"rm -rf /\");\n}";
        const unreachableCode = "const val = opt or.catch unreachable;";

        expect(bridge.checkUnsafePatterns(safeCode)).toBe(false);
        expect(bridge.checkUnsafePatterns(unsafeCode)).toBe(true);
        expect(bridge.checkUnsafePatterns(unreachableCode)).toBe(true);
    });

    it("should run and compile Zig tests using TestRunner", async () => {
        const runner = new TestRunner();

        // Create a temporary Zig test file in the repo to run and verify
        const tempZigFile = path.join(process.cwd(), "temp_test_file.zig");
        const zigCode =
            `const std = @import("std");\n` +
            `test "sum basic" {\n` +
            `    const a = 10;\n` +
            `    const b = 20;\n` +
            `    try std.testing.expect(a + b == 30);\n` +
            `}\n`;

        fs.writeFileSync(tempZigFile, zigCode, "utf-8");

        try {
            const results = await runner.runSelectiveTests(process.cwd(), [tempZigFile]);
            expect(results.success).toBe(true);
            expect(results.total_run).toBeGreaterThan(0);
            expect(results.failed).toBe(0);
        } finally {
            if (fs.existsSync(tempZigFile)) {
                fs.unlinkSync(tempZigFile);
            }
        }
    }, 20000);
});
