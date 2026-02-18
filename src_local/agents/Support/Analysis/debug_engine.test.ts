import { expect, test, describe } from "bun:test";
import { DebugEngine } from "./debug_engine";

describe("Debug Engine Deep Audit", () => {
    test("should trace file and return array", () => {
        const result = DebugEngine.trace_file("non-existent");
        expect(Array.isArray(result)).toBe(true);
    });
});
