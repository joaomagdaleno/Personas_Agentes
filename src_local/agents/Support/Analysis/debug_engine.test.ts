import { describe, it, expect } from "bun:test";
import { DebugEngine } from "./debug_engine.ts";

describe("DebugEngine Integrity", () => {
    it("should be importable", () => {
        expect(DebugEngine).toBeDefined();
    });

    it("should have trace_file method", () => {
        expect(typeof DebugEngine.trace_file).toBe("function");
    });
});
