import { describe, it, expect } from "bun:test";
import * as safety from "./safety_definitions";

describe("SafetyDefinitions Integrity", () => {
    it("should export ANALYZER_CLASSES from identifiers", () => {
        expect(safety.ANALYZER_CLASSES).toBeDefined();
        expect(safety.ANALYZER_CLASSES).toContain("LogicAuditor");
    });

    it("should export DANGEROUS_KEYWORDS from patterns", () => {
        expect(safety.DANGEROUS_KEYWORDS).toBeDefined();
        expect(safety.DANGEROUS_KEYWORDS.has("eval")).toBe(true);
    });

    it("should have SAFE_METADATA_VARS", () => {
        expect(Array.isArray(safety.SAFE_METADATA_VARS)).toBe(true);
        expect(safety.SAFE_METADATA_VARS).toContain("rule");
    });
});
