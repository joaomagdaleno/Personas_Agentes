import { expect, test, describe } from "bun:test";
import { HealerPersona } from "../src_local/agents/Support/Core/healer.ts";
import { CognitiveAnalyst } from "../src_local/agents/Support/Diagnostics/strategies/CognitiveAnalyst.ts";
import { CyclomaticAnalyst } from "../src_local/agents/Support/Diagnostics/strategies/CyclomaticAnalyst.ts";
import { LintRules } from "../src_local/agents/Support/Reporting/strategies/LintRules.ts";
import { FingerprintExtractor } from "../src_local/agents/Support/Analysis/strategies/FingerprintExtractor.ts";
import { StructuralAnalyst } from "../src_local/agents/Support/Analysis/structural_analyst.ts";
import { QualityEvaluator } from "../src_local/agents/Support/Diagnostics/strategies/QualityEvaluator.ts";

describe("🏛️ Sovereignty Bridge: Baseline Validation", () => {
    test("Healer Persona Integrity", () => {
        const healer = new HealerPersona();
        expect(healer.name).toBe("Healer");
    });

    test("Complexity Analyst Strategies", () => {
        expect(CognitiveAnalyst).toBeDefined();
        expect(CyclomaticAnalyst).toBeDefined();
    });

    test("Markdown Lint Rules", () => {
        expect(LintRules).toBeDefined();
    });

    test("Fingerprint Extraction Logic", () => {
        expect(FingerprintExtractor).toBeDefined();
    });

    test("Structural Audit Engine", () => {
        const analyst = new StructuralAnalyst();
        expect(analyst).toBeDefined();
    });

    test("Quality Evaluation Strategy", () => {
        expect(QualityEvaluator).toBeDefined();
    });
});
