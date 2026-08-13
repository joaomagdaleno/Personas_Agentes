import { describe, it, expect } from "bun:test";
import * as parityConfig from "./parity_config.ts";

describe("parity_config.ts Structure", () => {
    it("should export IGNORE_LIST", () => {
        expect(parityConfig.IGNORE_LIST).toBeDefined();
        expect(Array.isArray(parityConfig.IGNORE_LIST)).toBe(true);
    });

    it("should NOT export removed legacy mappings (Verification Phase)", () => {
        // Ensuring entropy reduction by verifying removal of unused data
        expect((parityConfig as any).LEGACY_ALIASES).toBeUndefined();
        expect((parityConfig as any).FILE_MAPPINGS).toBeUndefined();
    });

    it("should maintain parity with external ignore_list", async () => {
        const { IGNORE_LIST: externalList } = await import("./ignore_list.ts");
        expect(parityConfig.IGNORE_LIST).toBe(externalList);
    });
});
