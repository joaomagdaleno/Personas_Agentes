import { describe, it, expect } from "bun:test";
import { CognitiveEngine } from "../src_local/engines/strategic/strategic_cognitive_architect_service.ts";

describe("CognitiveEngine", () => {
    it("should reason about prompts", async () => {
        const engine = CognitiveEngine.getInstance();
        const res = await engine.reason("test prompt");
        expect(res).toBeDefined();
    });
});
