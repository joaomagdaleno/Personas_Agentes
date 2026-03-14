
import { BaseActivePersona } from "../src_local/agents/base.ts";
import { describe, it, expect } from "bun:test";
import * as path from "node:path";

// Concrete implementation for testing abstract class
class TestPersona extends BaseActivePersona {
    override async performAudit(): Promise<any[]> { return []; }
    override reasonAboutObjective(objective: string, file: string, content: string): any { return null; }
    override getSystemPrompt(): string { return "System Prompt"; }
    override getAuditRules(): { extensions: string[]; rules: any[] } { return { extensions: [], rules: [] }; }

    // Public accessor for protected method
    public initSupport() {
        this._initializeSupportTools();
    }

    // Public accessors for protected properties
    public getAuditEngine() { return this.auditEngine; }
    public getMaturityEvaluator() { return this.maturityEvaluator; }
}

describe("Deep Logic Parity (v7.5)", () => {
    const projectRoot = process.cwd();
    const persona = new TestPersona(projectRoot);

    it("should initialize support tools (Neural Bridge)", () => {
        persona.initSupport();

        const evaluator = persona.getMaturityEvaluator();
        expect(evaluator).toBeDefined();
        // Check if it's the real deal, not a stub
        expect(evaluator.constructor.name).toBe("MaturityEvaluator");
    });

    it("should return real maturity metrics", async () => {
        // We need to ensure support tools are init
        persona.initSupport();

        const metrics = await persona.getMaturityMetrics();
        console.log("Maturity Metrics:", metrics);

        expect(metrics).toBeDefined();
        expect(metrics.status).toBeDefined();
        // Assuming the project has files, score should be > 0 or at least calculated
        // If "Base" persona has no files in "Universal" stack, it might return 0 but structure should be correct
        expect(metrics).toHaveProperty("maturity_index");
    });
});
