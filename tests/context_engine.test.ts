import { describe, it, expect } from "bun:test";
import { ContextEngine } from "../src_local/engines/strategic/strategic_cognitive_architect_service.ts";

describe("ContextEngine", () => {
    it("should analyze project context", () => {
        const engine = new ContextEngine(process.cwd());
        expect(engine).toBeDefined();
    });
});
