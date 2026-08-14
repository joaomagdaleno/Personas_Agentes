import { describe, expect, test } from "bun:test";
import { TestRefiner } from "../src_local/engines/automation/test_refiner.ts";
import { TestArchitectAgent } from "../src_local/engines/automation/sync_devops_architect_service.ts";

describe("TestRefiner", () => {
    test("should create TestRefiner instance", () => {
        const refiner = new TestRefiner();
        expect(refiner).toBeDefined();
    });

    test("should analyze failure and return result", async () => {
        const refiner = new TestRefiner();
        const res = await refiner.analyzeFailure("test.ts", "assert(false)", "Error");
        expect(res).toBeDefined();
    }, 15000);

    test("should suggest test case and return result", async () => {
        const refiner = new TestRefiner();
        const res = await refiner.suggestTestCase("function add(a, b) { return a + b; }");
        expect(res).toBeDefined();
    }, 30000);

    test("should handle empty test file gracefully", async () => {
        const refiner = new TestRefiner();
        const res = await refiner.analyzeFailure("", "", "");
        expect(res).toBeDefined();
    }, 15000);

    test("should handle empty code snippet gracefully", async () => {
        const refiner = new TestRefiner();
        const res = await refiner.suggestTestCase("");
        expect(res).toBeDefined();
    }, 15000);
});

describe("TestArchitectAgent", () => {
    test("should create TestArchitectAgent instance", () => {
        expect(TestArchitectAgent).toBeDefined();
    });
});
