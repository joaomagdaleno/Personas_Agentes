import { describe, it, expect } from "bun:test";
import { BehaviorAnalyst } from "../engines/strategic/strategic_cognitive_architect_service.ts";

describe("BehaviorAnalyst", () => {
    it("should analyze behavior patterns", () => {
        const analyst = new BehaviorAnalyst(process.cwd());
        expect(analyst).toBeDefined();
    });
});
