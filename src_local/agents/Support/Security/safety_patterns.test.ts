import { expect, test, describe } from "bun:test";
import { DANGEROUS_KEYWORDS, TRIVIAL_COMPARE_KEYWORDS, PATTERN_MODE } from "./safety_patterns";

describe("Safety Patterns Deep Audit", () => {
    test("should contain critical dangerous keywords", () => {
        expect(DANGEROUS_KEYWORDS).toContain('exec(');
        expect(DANGEROUS_KEYWORDS).toContain('eval(');
    });

    test("should contain trivial comparison keywords", () => {
        expect(TRIVIAL_COMPARE_KEYWORDS).toContain('eval');
        expect(TRIVIAL_COMPARE_KEYWORDS).toContain('global');
    });

    test("should have pattern mode defined", () => {
        expect(PATTERN_MODE).toBe('STRICT');
    });
});
