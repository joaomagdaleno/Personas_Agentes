import { describe, it, expect } from "bun:test";
import { formatFindingSummary } from "./audit_helpers.ts";

describe("audit_helpers Test Suite", () => {
    it("should format finding summary correctly", () => {
        const finding = { file: "test.ts", issue: "Memory Leak", severity: "HIGH" };
        const summary = formatFindingSummary(finding as any);
        expect(typeof summary).toBe("string");
    });
});
