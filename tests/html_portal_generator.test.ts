import { describe, it, expect } from "bun:test";
import { GENERATOR_CONFIG, PORTAL_METADATA } from "../src_local/engines/reporting/ui_ux_architect_service.ts";

describe("HTML Portal Generator Deep Audit", () => {
    it("should have valid generator config", () => {
        expect(GENERATOR_CONFIG.mode).toBe("PROFESSIONAL");
        expect(GENERATOR_CONFIG.target).toBe("SOVEREIGN");
    });

    it("should utilize correct portal metadata", () => {
        expect(PORTAL_METADATA.title).toContain("PhD");
    });
});
