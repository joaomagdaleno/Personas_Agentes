import { describe, it, expect } from "bun:test";
import { RegistryManager } from "./registry_manager.ts";

describe("RegistryManager Test Suite", () => {
    it("should instantiate RegistryManager with project root", () => {
        const registry = new RegistryManager(process.cwd());
        expect(registry).toBeDefined();
    });

    it("should load all agent stacks", async () => {
        const registry = new RegistryManager(process.cwd());
        const stacks = await registry.loadAllStacks();
        expect(stacks).toBeDefined();
    });
});
