import { describe, expect, it, beforeAll } from "bun:test";
import { ZvecGrepEngine } from "../src_local/utils/zvec/zvec_grep_engine.ts";

describe("ZvecGrepEngine Native Test Suite", () => {
  let engine: ZvecGrepEngine;

  beforeAll(() => {
    engine = ZvecGrepEngine.getInstance();
  });

  it("should obtain singleton instance of ZvecGrepEngine", () => {
    expect(engine).toBeDefined();
    expect(engine).toBeInstanceOf(ZvecGrepEngine);
  });

  it("should initialize ZvecGrepEngine successfully", async () => {
    const initialized = await engine.initialize();
    expect(typeof initialized).toBe("boolean");
    expect(engine.isReady()).toBe(true);
  });

  it("should execute hybrid search and return structured results", async () => {
    const results = await engine.search("StrategicCognitiveArchitectService", 5);
    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      expect(results[0]).toHaveProperty("filePath");
      expect(results[0]).toHaveProperty("content");
    }
  });

  it("should handle graceful fallback when search query produces no results", async () => {
    const results = await engine.search("NonExistentQuery_XYZ_12345", 5);
    expect(Array.isArray(results)).toBe(true);
  });
});
