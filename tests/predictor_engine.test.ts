import { describe, it, expect, beforeEach } from "bun:test";
import { PredictorEngine, MicroGPT, NeuralSubsystemService } from "../src_local/engines/strategic/neural_subsystem_service.ts";
import * as os from "node:os";
import * as path from "node:path";

describe("PredictorEngine and NeuralSubsystem Unit Tests", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = path.join(os.tmpdir(), `psa-predictor-test-${Math.random().toString(36).substring(7)}`);
    });

    it("should instantiate PredictorEngine, record valid events, and evaluate flow sanity", () => {
        // Arrange - Component: PredictorEngine | Pattern: AAA
        const engine = new PredictorEngine(tmpDir);

        // Act
        engine.recordEvent("PIPELINE_START");
        engine.recordEvent("DISCOVERY_PHASE_START");
        engine.recordEvent("DISCOVERY_FINDINGS");

        const sanity = engine.getSanityMetrics();

        // Assert
        expect(typeof sanity.score).toBe("number");
        expect(sanity.status).toBeDefined();
        expect(sanity.label).toBeDefined();

        engine.clearCurrentSequence();
        expect(engine.evaluateCurrentFlow()).toBe(0);
    });

    it("should process forward pass on MicroGPT", () => {
        // Arrange - Component: MicroGPT | Pattern: AAA
        const microGpt = new MicroGPT(128);
        const inputIds = [10, 20, 30, 40];

        // Act
        const logits = microGpt.forward(inputIds);

        // Assert
        expect(logits.length).toBe(inputIds.length);
        expect(logits.every(val => typeof val === "number")).toBe(true);
    });

    it("should generate thought vector using NeuralSubsystemService", () => {
        // Arrange - Component: NeuralSubsystemService | Pattern: AAA
        const service = new NeuralSubsystemService();

        // Act
        const output = service.generateThought("Analise sintática de código");

        // Assert
        expect(output).toContain("[Neural Thought]");
        expect(output).toContain("Output Vector Size:");
    });
});
