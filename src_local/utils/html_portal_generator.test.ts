import { expect, test, describe } from "bun:test";
import { GENERATOR_CONFIG } from "./html_portal_generator";
import { PORTAL_METADATA } from "./portal_engine";

describe("HTML Portal Generator Deep Audit", () => {
    test("should have valid generator config", () => {
        expect(GENERATOR_CONFIG.mode).toBe("PROFESSIONAL");
        expect(GENERATOR_CONFIG.target).toBe("SOVEREIGN");
    });

    test("should utilize correct portal metadata", () => {
        expect(PORTAL_METADATA.title).toContain("PhD");
        expect(PORTAL_METADATA.version).toBeDefined();
    });
});
