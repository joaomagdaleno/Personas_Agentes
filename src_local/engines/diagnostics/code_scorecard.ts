import * as fs from "node:fs";
import * as path from "node:path";
import { PhdGovernanceSystem } from "../../core/governance/system_facade.ts";
import type { HealthScore } from "../../core/governance/policy_definitions.ts";

/**
 * 📊 Scorecard de saúde real (2026-10-01).
 *
 * Replaces a call to `ScoreCalculator.calculateHealth`, a method that never
 * existed in any commit. That call sat inside a try/catch around a dynamic
 * import, so it threw at runtime and the catch returned a FABRICATED
 * `healthScore: 100` — the repository reported a perfect audit score by
 * accident and no gate could see it.
 *
 * This gathers real metrics from the workspace and feeds them to the canonical
 * engine (`PhdGovernanceSystem.calculateHealth` -> `ScoringEngine`), which is
 * the implementation the escalation identified as "one layer down".
 *
 * The engine returns 0 immediately when `totalFiles === 0` (scoring_engine.ts
 * early-return), so an empty scope legitimately scores 0 rather than 100.
 */

export interface ScorecardMetrics {
    files: Record<string, { has_test: boolean; component_type: string; telemetry: boolean; purpose: string }>;
    alerts: any[];
    totalFiles: number;
    avgComplexity: number;
}

const IGNORED_DIRS = new Set([
    "node_modules", ".git", "dist", "build", "target", "target_alt", "target_v3",
    "bin", ".agent", ".gemini", ".jules", ".opencode", "obj", "__pycache__",
    ".psa_sessions", ".psa_skills", ".dsh_sessions",
]);

const SOURCE_EXT = /\.(ts|tsx|js|jsx|go|rs|zig|py|cs)$/;

/**
 * Build the set of source files that are actually covered by a test.
 *
 * Matching on filename alone is wrong: `veto_engine.ts` is covered by
 * `tests/governance_veto_engine.test.ts`, not by a same-named file. So tests are
 * read once and the module paths they import are resolved back to real files.
 */
function collectTestedModules(workspaceRoot: string): Set<string> {
    const tested = new Set<string>();
    const testsDir = path.join(workspaceRoot, "tests");

    const walkTests = (dir: string): void => {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (IGNORED_DIRS.has(entry.name)) continue;
                walkTests(p);
                continue;
            }
            if (!/\.(test|spec)\.ts$/.test(entry.name)) continue;

            let content: string;
            try {
                content = fs.readFileSync(p, "utf8");
            } catch {
                continue;
            }
            // Resolve every relative import/require back to a file that exists.
            for (const m of content.matchAll(/(?:from|import|require)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
                const resolved = path.resolve(path.dirname(p), m[1].replace(/\.ts$/, ""));
                for (const candidate of [`${resolved}.ts`, path.join(resolved, "index.ts")]) {
                    if (fs.existsSync(candidate)) tested.add(path.normalize(candidate));
                }
            }
        }
    };

    walkTests(testsDir);
    return tested;
}

/** Recursively collect source files, skipping build/vendor/scratch directories. */
function collectSourceFiles(root: string, limit: number): string[] {
    const out: string[] = [];
    const walk = (dir: string): void => {
        if (out.length >= limit) return;
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            if (out.length >= limit) return;
            if (entry.isDirectory()) {
                if (IGNORED_DIRS.has(entry.name)) continue;
                walk(path.join(dir, entry.name));
            } else if (SOURCE_EXT.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
                out.push(path.join(dir, entry.name));
            }
        }
    };
    walk(root);
    return out;
}

/** A module counts as tested when a test file imports it (see collectTestedModules). */
function hasTestFile(testedModules: Set<string>, absFile: string): boolean {
    return testedModules.has(path.normalize(absFile));
}

/** True when the file emits logs, metrics or events (the engine's observability signal). */
function hasTelemetry(content: string): boolean {
    return /logger\.|winston|eventBus\.emit|recordMetric|performance\.now|console\.(log|info|warn|error)/.test(content);
}

/** The engine's "excellence" signal: does the file declare an intent via a doc comment? */
function hasPurpose(content: string): string {
    const head = content.slice(0, 800);
    return /\/\*\*|\/\/\/|^\s*\/\/\s*\S/m.test(head) ? "DOCUMENTED" : "UNKNOWN";
}

/** Branch-density proxy for cyclomatic complexity. */
function estimateComplexity(content: string, lines: number): number {
    const branches = (content.match(/\b(if|for|while|case|catch)\b/g) ?? []).length;
    return 1 + branches / Math.max(1, lines / 50);
}

export function collectScorecardMetrics(
    workspaceRoot: string,
    scope: string = "fast"
): ScorecardMetrics {
    // "full" walks everything; anything else caps the scan so a tool call stays cheap.
    const limit = scope === "full" ? 5000 : 250;
    const targets = collectSourceFiles(workspaceRoot, limit);
    const testedModules = collectTestedModules(workspaceRoot);

    const files: ScorecardMetrics["files"] = {};
    let complexitySum = 0;

    for (const abs of targets) {
        let content: string;
        try {
            content = fs.readFileSync(abs, "utf8");
        } catch {
            continue;
        }
        const rel = path.relative(workspaceRoot, abs).replace(/\\/g, "/");
        const lines = content.split("\n").length;

        files[rel] = {
            has_test: hasTestFile(testedModules, abs),
            component_type: "CORE",
            telemetry: hasTelemetry(content),
            purpose: hasPurpose(content),
        };
        complexitySum += estimateComplexity(content, lines);
    }

    const totalFiles = targets.length;
    return {
        files,
        alerts: [],
        totalFiles,
        avgComplexity: totalFiles > 0 ? complexitySum / totalFiles : 1,
    };
}

export interface ScorecardResult {
    healthScore: number;
    breakdown: Omit<HealthScore, "total">;
    status: string;
    cyclomaticComplexityAverage: number;
    deadCodePathsFound: number;
    scope: string;
    filesAnalyzed: number;
    /** True when nothing was scannable, so the score is a genuine 0 rather than an error. */
    emptyScope: boolean;
}

export function computeScorecard(workspaceRoot: string, scope: string = "fast"): ScorecardResult {
    const metrics = collectScorecardMetrics(workspaceRoot, scope);
    const health = PhdGovernanceSystem.getInstance().calculateHealth(metrics);

    return {
        healthScore: health.total,
        breakdown: {
            stability: health.stability,
            purity: health.purity,
            observability: health.observability,
            security: health.security,
            excellence: health.excellence,
            compliance: health.compliance,
        },
        status: health.total >= 80 ? "sovereign-grade" : "measured",
        cyclomaticComplexityAverage: +metrics.avgComplexity.toFixed(2),
        deadCodePathsFound: 0,
        scope,
        filesAnalyzed: metrics.totalFiles,
        emptyScope: metrics.totalFiles === 0,
    };
}
