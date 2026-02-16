import { describe, expect, test } from "bun:test";
import { TestRunner } from "../src_local/agents/Support/Automation/test_runner";

describe("TestRunner", () => {
    const testRunner = new TestRunner();

    test("should create TestRunner instance", () => {
        expect(testRunner).toBeDefined();
        expect(typeof testRunner.runUnittestDiscover).toBe("function");
        expect(typeof testRunner.runSelectiveTests).toBe("function");
        expect(typeof testRunner.benchmark).toBe("function");
    });

    test("should handle missing project root", async () => {
        const result = await testRunner.runParallelDiscovery("");
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.total_run).toBe(0);
        expect(result.failed).toBe(0);
        expect(result.pass_rate).toBe(0);
    });

    test("should handle no test files in selective tests", async () => {
        const result = await testRunner.runSelectiveTests(".", ["src/file1.ts", "src/file2.js"]);
        expect(result.success).toBe(true);
        expect(result.total_run).toBe(0);
        expect(result.failed).toBe(0);
        expect(result.pass_rate).toBe(0);
        expect(result.message).toBe("No test files in changed set.");
    });
});
