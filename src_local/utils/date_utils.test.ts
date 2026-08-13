import { describe, it, expect } from "bun:test";
import { formatDate, getPhdTimestamp, DATE_FORMAT } from "../engines/reporting/ui_ux_architect_service.ts";

describe("Date Utils Deep Audit", () => {
    it("should export DATE_FORMAT string", () => {
        expect(DATE_FORMAT).toBe("YYYY-MM-DD HH:mm:ss.SSS");
    });

    it("should generate valid ISO-like timestamps", () => {
        const ts = formatDate();
        expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/);
    });
});
