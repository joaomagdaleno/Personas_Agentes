import { expect, test, describe } from "bun:test";
import { THEME_NAME, CORE_COLORS, TYPE_SETTINGS } from "../dashboard/theme";

describe("Theme System Deep Audit", () => {
    test("should have correct theme name", () => {
        expect(THEME_NAME).toBe("Sentinel Dark");
    });

    test("should have required core colors", () => {
        expect(CORE_COLORS.bg).toBeDefined();
        expect(CORE_COLORS.accent).toBeDefined();
    });

    test("should define typography standards", () => {
        expect(TYPE_SETTINGS.display).toBe("Inter");
    });
});
