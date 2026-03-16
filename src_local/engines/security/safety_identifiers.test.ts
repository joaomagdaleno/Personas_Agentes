import { expect, test, describe } from "bun:test";
import { ANALYZER_CLASSES, ANALYZER_METHODS, META_ANALYSIS_LIBS } from "./safety_identifiers";

describe("Safety Identifiers Deep Audit", () => {
    test("should have required analyzer classes", () => {
        expect(ANALYZER_CLASSES).toContain('LogicAuditor');
        expect(ANALYZER_CLASSES).toContain('IntegrityGuardian');
        expect(ANALYZER_CLASSES.length).toBeGreaterThan(5);
    });

    test("should have critical analysis methods", () => {
        expect(ANALYZER_METHODS).toContain('audit');
        expect(ANALYZER_METHODS).toContain('scan_flaws');
        expect(ANALYZER_METHODS.length).toBeGreaterThan(5);
    });

    test("should define meta analysis libraries", () => {
        expect(META_ANALYSIS_LIBS).toContain('ast');
        expect(META_ANALYSIS_LIBS).toContain('re');
    });
});
