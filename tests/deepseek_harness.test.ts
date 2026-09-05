import { describe, expect, it } from "bun:test";
import { DeepSeekHarnessEngine } from "../src_local/utils/ai/deepseek_harness.ts";

describe("DeepSeekHarnessEngine Test Suite", () => {
  it("should obtain singleton instance of DeepSeekHarnessEngine", () => {
    const harness = DeepSeekHarnessEngine.getInstance();
    expect(harness).toBeDefined();
    expect(harness).toBeInstanceOf(DeepSeekHarnessEngine);
  });

  it("should execute evaluation harness suite successfully", async () => {
    const harness = DeepSeekHarnessEngine.getInstance();
    const report = await harness.runHarness();
    expect(report).toBeDefined();
    expect(report.totalCases).toBeGreaterThan(0);
    expect(typeof report.accuracyPercentage).toBe("number");
    expect(Array.isArray(report.results)).toBe(true);
  });
});
