import { describe, it, expect } from "bun:test";
import { DiagnosticPipeline } from "./diagnostic_pipeline.ts";
import { Orchestrator } from "./orchestrator.ts";

describe("DiagnosticPipeline Core Test Suite", () => {
    it("should instantiate DiagnosticPipeline with Orchestrator", () => {
        const orchestrator = new Orchestrator(process.cwd());
        const pipeline = new DiagnosticPipeline(orchestrator);
        expect(pipeline).toBeDefined();
        expect(pipeline.orc).toBe(orchestrator);
    });
});
