import { describe, it, expect } from "bun:test";
import { UIUXArchitectService, formatDate, getPhdTimestamp, DATE_FORMAT } from "../src_local/engines/reporting/ui_ux_architect_service.ts";

describe("UIUXArchitectService Deep Test Suite", () => {
    it("should instantiate UIUXArchitectService correctly", () => {
        const service = new UIUXArchitectService();
        expect(service).toBeDefined();
    });

    it("should export correct DATE_FORMAT constant", () => {
        expect(DATE_FORMAT).toBe("YYYY-MM-DD HH:mm:ss.SSS");
    });

    it("should format dates into valid ISO-like string format", () => {
        const now = new Date("2026-08-12T12:00:00.000Z");
        const formatted = formatDate(now);
        expect(formatted).toContain("2026-08-12");
        expect(formatted).not.toContain("T");
        expect(formatted).not.toContain("Z");
    });

    it("should generate PhD timestamps matching formatDate", () => {
        const date = new Date();
        expect(getPhdTimestamp(date)).toBe(formatDate(date));
    });
});
