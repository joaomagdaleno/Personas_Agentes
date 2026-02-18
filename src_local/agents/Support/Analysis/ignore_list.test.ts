import { describe, it, expect } from "bun:test";
import { IGNORE_LIST } from "./ignore_list.ts";

describe("ignore_list.ts Integrity", () => {
    it("should be an array of strings", () => {
        expect(Array.isArray(IGNORE_LIST)).toBe(true);
        expect(IGNORE_LIST.every(item => typeof item === "string")).toBe(true);
    });

    it("should not contain duplicates", () => {
        const uniqueItems = new Set(IGNORE_LIST);
        expect(uniqueItems.size).toBe(IGNORE_LIST.length);
    });

    it("should contain critical legacy files", () => {
        const criticalFiles = [
            "chat_view_legacy.py",
            "cli_legacy.py",
            "dashboard_view_legacy.py",
            "cognitive_engine_legacy.py"
        ];
        criticalFiles.forEach(file => {
            expect(IGNORE_LIST).toContain(file);
        });
    });

    it("should only contain valid extensions or paths", () => {
        const validPattern = /\.(py|ts|js|tsx|dart|kt|db|lock|json|txt|md|lock)$|^src_local\/[^\s]+$/;
        IGNORE_LIST.forEach(file => {
            expect(file).toMatch(validPattern);
        });
    });

    it("should have a substantial number of items (integrity check)", () => {
        // High resolution check to ensure list wasn't accidentally truncated
        expect(IGNORE_LIST.length).toBeGreaterThan(200);
    });
});
