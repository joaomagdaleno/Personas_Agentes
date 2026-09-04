import { describe, expect, it, beforeAll } from "bun:test";
import { IntelligenceControlEngine } from "../src_local/engines/diagnostics/intelligence_control_engine.ts";
import * as fs from "node:fs";
import * as path from "node:path";

describe("IntelligenceControlEngine Test Suite", () => {
  let engine: IntelligenceControlEngine;

  beforeAll(() => {
    engine = new IntelligenceControlEngine();
  });

  it("should instantiate IntelligenceControlEngine correctly", () => {
    expect(engine).toBeDefined();
    expect(engine).toBeInstanceOf(IntelligenceControlEngine);
  });

  it("should detect project technologies and features", () => {
    const techs = engine.detectProjectTechnologies();
    expect(Array.isArray(techs)).toBe(true);
    expect(techs.length).toBeGreaterThan(0);

    const techIds = techs.map(t => t.id);
    expect(techIds).toContain("ts_bun");
    expect(techIds).toContain("zvec_grep");
  });

  it("should evaluate capabilities of all 8 Super Personas", () => {
    const capabilities = engine.evaluatePersonaCapabilities();
    expect(Array.isArray(capabilities)).toBe(true);
    expect(capabilities.length).toBe(8);

    const keys = capabilities.map(c => c.personaKey);
    expect(keys).toContain("strategic_cognitive_architect");
    expect(keys).toContain("audit_code_guardian");
  });

  it("should generate full intelligence coverage report and write Markdown file", () => {
    const report = engine.generateReport();
    expect(report).toBeDefined();
    expect(typeof report.coveragePercentage).toBe("number");
    expect(report.totalSuperPersonasEvaluated).toBe(8);

    const reportPath = path.join(process.cwd(), "docs", "INTELLIGENCE_COVERAGE_REPORT.md");
    expect(fs.existsSync(reportPath)).toBe(true);
  });
});
