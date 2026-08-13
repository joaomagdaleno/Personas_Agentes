import { describe, it, expect } from "bun:test";
import { SystemManager } from "./system_manager.ts";

describe("SystemManager Test Suite", () => {
    it("should obtain singleton instance of SystemManager", () => {
        const manager1 = SystemManager.getInstance();
        const manager2 = SystemManager.getInstance();
        expect(manager1).toBe(manager2);
    });
});
