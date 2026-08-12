import { describe, it, expect, mock } from "bun:test";
import { PenaltyEngine } from "../src_local/engines/healing/penalty_engine.ts";
import { AdjustmentCalculator } from "../src_local/engines/diagnostics/strategies/AdjustmentCalculator.ts";
import { CalcHelpers } from "../src_local/engines/diagnostics/strategies/CalcHelpers.ts";
import { ThresholdHelpers } from "../src_local/engines/diagnostics/strategies/ThresholdHelpers.ts";
import { ComplianceHelpers } from "../src_local/engines/diagnostics/strategies/ComplianceHelpers.ts";

describe("ThresholdHelpers Suite", () => {
    it("should increment stats when metrics exceed scalar boundaries", () => {
        const stats = { cc: 0, cog: 0, nest: 0, cbo: 0, dit: 0 };
        const m = {
            cyclomaticComplexity: 25, // > 20
            cognitiveComplexity: 18,  // > 15
            nestingDepth: 4,          // > 3
            cbo: 12,                  // > 10
            dit: 6                    // > 5
        };

        ThresholdHelpers.checkStructural(m, stats);

        expect(stats.cc).toBe(1);
        expect(stats.cog).toBe(1);
        expect(stats.nest).toBe(1);
        expect(stats.cbo).toBe(1);
        expect(stats.dit).toBe(1);
    });

    it("should NOT increment stats if metrics are within safe boundaries", () => {
        const stats = { cc: 0, cog: 0, nest: 0, cbo: 0, dit: 0 };
        const m = {
            cyclomaticComplexity: 10,
            cognitiveComplexity: 10,
            nestingDepth: 2,
            cbo: 5,
            dit: 3
        };

        ThresholdHelpers.checkStructural(m, stats);

        expect(stats.cc).toBe(0);
        expect(stats.cog).toBe(0);
        expect(stats.nest).toBe(0);
        expect(stats.cbo).toBe(0);
        expect(stats.dit).toBe(0);
    });
});

describe("ComplianceHelpers Suite", () => {
    it("should identify maintainability issues, defect density, and quality gates", () => {
        const stats = { miL: 0, miC: 0, def: 0, red: 0, shad: 0, shallow: 0 };
        const m = {
            maintainabilityIndex: 4, // >0 and <10 (miL++), and <5 (miC++)
            defectDensity: 2,        // > 1
            qualityGate: "RED",      // red++
            isShadow: true,
            shadowCompliance: { compliant: false } // shad++
        };
        const item = { file: "test.ts", test_status: "SHALLOW" };
        const info = { component_type: "AGENT", complexity: 5 };

        ComplianceHelpers.checkQuality(m, stats, item, info);

        expect(stats.miL).toBe(1);
        expect(stats.miC).toBe(1);
        expect(stats.def).toBe(1);
        expect(stats.red).toBe(1);
        expect(stats.shad).toBe(1);
    });

    it("should flag SHALLOW test status correctly under compliance rules", () => {
        const stats = { miL: 0, miC: 0, def: 0, red: 0, shad: 0, shallow: 0 };
        const m = { qualityGate: "YELLOW" };
        const item = { file: "agent.ts", test_status: "SHALLOW" };
        const info = { component_type: "AGENT", complexity: 3 };

        ComplianceHelpers.checkQuality(m, stats, item, info);
        expect(stats.shallow).toBe(1);
    });

    it("should NOT flag SHALLOW tests if quality gate is GREEN", () => {
        const stats = { miL: 0, miC: 0, def: 0, red: 0, shad: 0, shallow: 0 };
        const m = { qualityGate: "GREEN" };
        const item = { file: "agent.ts", test_status: "SHALLOW" };
        const info = { component_type: "AGENT", complexity: 3 };

        ComplianceHelpers.checkQuality(m, stats, item, info);
        expect(stats.shallow).toBe(0);
    });
});

describe("CalcHelpers and AdjustmentCalculator Suite", () => {
    it("should aggregate results correctly through AdjustmentCalculator.calculate", () => {
        const matrix = [
            {
                file: "src_local/core/db.ts",
                test_status: "SHALLOW",
                advanced_metrics: {
                    cyclomaticComplexity: 25,
                    cognitiveComplexity: 20,
                    nestingDepth: 4,
                    cbo: 15,
                    dit: 8,
                    maintainabilityIndex: 3,
                    defectDensity: 2,
                    qualityGate: "RED",
                    isShadow: true,
                    shadowCompliance: { compliant: false }
                }
            }
        ];

        const mapData = {
            "src_local/core/db.ts": {
                component_type: "CORE",
                complexity: 10
            }
        };

        const caps = {}; // Not strictly used inside calculate since it delegates to CalcHelpers
        const stats = AdjustmentCalculator.calculate(matrix, mapData, caps);

        expect(stats.total).toBe(1);
        expect(stats.cc).toBe(1);
        expect(stats.cog).toBe(1);
        expect(stats.nest).toBe(1);
        expect(stats.cbo).toBe(1);
        expect(stats.dit).toBe(1);
        expect(stats.miL).toBe(1);
        expect(stats.miC).toBe(1);
        expect(stats.def).toBe(1);
        expect(stats.red).toBe(1);
        expect(stats.shad).toBe(1);
        expect(stats.shallow).toBe(1);
    });
});

describe("PenaltyEngine Suite", () => {
    it("should calculate TypeScript Fallback score correctly (ceiling & drain)", async () => {
        const engine = new PenaltyEngine();

        const rawScore = 95;
        // high severity alert sets ceiling to 70
        const alerts = [{ severity: "high" }];
        const mapData = {};
        const total = 100;

        const score = await engine.apply(rawScore, alerts, mapData, total, null, null);

        // Raw 95, Ceiling 70, Drain 0 -> Expected final score = 70
        expect(score).toBe(70);
    });

    it("should calculate medium severity alert ceiling correctly", async () => {
        const engine = new PenaltyEngine();

        const rawScore = 98;
        const alerts = [{ severity: "medium" }];
        const mapData = {};
        const total = 100;

        const score = await engine.apply(rawScore, alerts, mapData, total, null, null);

        // Raw 98, Ceiling 95, Drain 0 -> Expected final score = 95
        expect(score).toBe(95);
    });

    it("should apply drains correctly based on calculated quality and cognitive status", async () => {
        const engine = new PenaltyEngine();

        const rawScore = 90;
        const alerts = [];
        const mapData = {
            "file1.ts": { component_type: "CORE" }
        };
        const qaData = {
            matrix: [
                {
                    file: "file1.ts",
                    test_status: "OK",
                    advanced_metrics: {
                        cyclomaticComplexity: 30, // exceeds boundary
                        cognitiveComplexity: 25,  // exceeds boundary
                    }
                }
            ]
        };
        const cognitive = { status: "FAIL" }; // Adds 5 cogPenalty

        // stats.total = 1.
        // prop(stats.cc, caps.cc=5) = Math.round(Math.min(5, (1 / 1) * 5) * 10) / 10 = 5
        // prop(stats.cog, caps.cognitive=4) = Math.round(Math.min(4, (1 / 1) * 4) * 10) / 10 = 4
        // Cog penalty: 5
        // Total drain = 5 (cc) + 4 (cog) + 5 (cognitive status) = 14
        // Final score = Min(90, 100) - 14 = 76
        const score = await engine.apply(rawScore, alerts, mapData, 100, qaData, cognitive);
        expect(score).toBe(76);
    });

    it("should fallback to TS calculation when gRPC client call fails", async () => {
        const mockHubManager = {
            penalty: async () => {
                throw new Error("gRPC failure");
            }
        } as any;

        const engine = new PenaltyEngine(mockHubManager);

        const rawScore = 80;
        const alerts = [{ severity: "critical" }]; // ceiling 70
        const mapData = {};

        const score = await engine.apply(rawScore, alerts, mapData, 100, null, null);
        expect(score).toBe(70);
    });

    it("should use gRPC when client is online and responds successfully", async () => {
        const mockHubManager = {
            penalty: async (req: any) => {
                return {
                    ceiling: 80,
                    total_drain: 10,
                    final_score: 70
                };
            }
        } as any;

        const engine = new PenaltyEngine(mockHubManager);

        const rawScore = 90;
        const alerts = [];
        const mapData = {};

        const score = await engine.apply(rawScore, alerts, mapData, 100, null, null);
        expect(score).toBe(70);
    });
});
