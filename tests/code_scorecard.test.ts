import { describe, it, expect } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { computeScorecard, collectScorecardMetrics } from "../src_local/engines/diagnostics/code_scorecard.ts";
import { ScoringEngine } from "../src_local/core/governance/scoring_engine.ts";

/**
 * Component Under Test: src_local/engines/diagnostics/code_scorecard.ts
 *
 * Covers the 2026-10-01 fix for the fabricated `code_auditor.scorecard` result.
 * The plugin used to call `ScoreCalculator.calculateHealth`, a method that never
 * existed, and a catch returned a hardcoded 100. These tests pin the honest
 * behaviour: a real score derived from the canonical engine, and a genuine 0 for
 * an empty workspace (the engine early-returns on totalFiles === 0).
 */
describe("code_scorecard (real health metrics)", () => {
    const projectRoot = process.cwd();

    it("scores the real project source tree with a non-zero, plausible value", () => {
        const result = computeScorecard(projectRoot, "fast");

        expect(result.filesAnalyzed).toBeGreaterThan(0);
        expect(result.emptyScope).toBe(false);
        // A health score is bounded 0-100. The floor of 50 is a REGRESSION GUARD, not a
        // claim that the codebase is healthy: the measured value at introduction was
        // 53.71 and it falls whenever untested/undocumented files are added. The real
        // signal is the independence check in the next test.
        expect(result.healthScore).toBeGreaterThan(50);
        expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it("derives its score from the canonical engine rather than an ad-hoc formula", () => {
        const metrics = collectScorecardMetrics(projectRoot, "fast");
        const engineScore = new ScoringEngine().calculateHealth(metrics);
        const scorecard = computeScorecard(projectRoot, "fast");

        // Independence check: the tool must agree with the governance engine it claims
        // to delegate to. If someone reintroduces a hand-rolled score, this fails.
        expect(scorecard.healthScore).toBe(engineScore.total);
        expect(scorecard.breakdown.stability).toBe(engineScore.stability);
        expect(scorecard.breakdown.excellence).toBe(engineScore.excellence);
        expect(scorecard.breakdown.compliance).toBe(engineScore.compliance);
    });

    it("reports a genuine 0 for an empty workspace instead of a fabricated score", () => {
        const empty = path.join(projectRoot, `.psa_scorecard_empty_${Date.now()}`);
        fs.mkdirSync(empty, { recursive: true });
        try {
            const result = computeScorecard(empty, "fast");
            expect(result.filesAnalyzed).toBe(0);
            expect(result.emptyScope).toBe(true);
            expect(result.healthScore).toBe(0);
        } finally {
            fs.rmSync(empty, { recursive: true, force: true });
        }
    });

    it("counts a module as tested only when a matching test file exists", () => {
        const metrics = collectScorecardMetrics(projectRoot, "fast");
        const entries = Object.entries(metrics.files);
        expect(entries.length).toBeGreaterThan(0);

        // scoring_engine.ts has tests/scoring_engine-ish coverage via the governance
        // suites; veto_engine.ts has tests/governance_veto_engine.test.ts. Use the latter
        // as a positive control and assert the flag is a boolean everywhere.
        const veto = entries.find(([rel]) => rel.endsWith("core/governance/veto_engine.ts"));
        if (veto) {
            expect(veto[1].has_test).toBe(true);
        }
        for (const [, meta] of entries) {
            expect(typeof meta.has_test).toBe("boolean");
            expect(typeof meta.telemetry).toBe("boolean");
        }
    });

    it("never reports the old fabricated sovereign-grade score for an empty scope", () => {
        const empty = path.join(projectRoot, `.psa_scorecard_guard_${Date.now()}`);
        fs.mkdirSync(empty, { recursive: true });
        try {
            const result = computeScorecard(empty, "fast");
            // The regression this guards: a hardcoded 100 with status "sovereign-grade".
            expect(result.healthScore).not.toBe(100);
            expect(result.status).not.toBe("sovereign-grade");
        } finally {
            fs.rmSync(empty, { recursive: true, force: true });
        }
    });
});
