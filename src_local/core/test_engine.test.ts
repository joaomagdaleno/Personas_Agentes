import { describe, it, expect } from "bun:test";
import { TestEngine } from "./test_engine.ts";

describe("TestEngine Test Suite", () => {
    it("should instantiate TestEngine with project root", () => {
        const engine = new TestEngine(process.cwd());
        expect(engine).toBeDefined();
    });
});
