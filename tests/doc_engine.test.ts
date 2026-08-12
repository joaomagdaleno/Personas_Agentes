import { describe, it, expect } from "bun:test";
import { DocEngine } from "../src_local/core/doc_engine.ts";

describe("DocEngine Test Suite", () => {
    it("should instantiate DocEngine correctly", () => {
        const engine = new DocEngine();
        expect(engine).toBeDefined();
    });

    it("should generate docstring from partial content", async () => {
        const engine = new DocEngine();
        const doc = await engine.generateDocstring("sample.ts", "console.log('hello');");
        expect(typeof doc).toBe("string");
    });
});
