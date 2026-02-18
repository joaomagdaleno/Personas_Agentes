import { expect, test, describe } from "bun:test";
import { getPhdTimestamp, DATE_FORMAT } from "./date_utils";

describe("Date Utils Deep Audit", () => {
    test("should follow PHD format standard", () => {
        expect(DATE_FORMAT).toContain("YYYY-MM-DD");
    });

    test("should generate valid ISO-like timestamps", () => {
        const ts = getPhdTimestamp();
        expect(ts).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });
});
