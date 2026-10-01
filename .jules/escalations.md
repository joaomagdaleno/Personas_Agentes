# Escalations (Human-in-the-loop)

Format:
## YYYY-MM-DD HH:MM – Escalation
**Raised by:** [Agent]
**Decision needed:** [one sentence]
**Context:** [why autonomous action is not allowed]
**Options:** A) ... B) ... C) ...
**Recommended:** [A/B/C] because ...
**Status:** PENDING HUMAN   <-- template placeholder; see Resolved history below for real entries

Resolution: set **Status** to `RESOLVED <YYYY-MM-DD>` and add a **Resolution:** line with the
evidence (merged PR number, commit SHA, or the change that removed the blocker). A resolved
escalation moves to the `Resolved history` section below so that this file only shows live work
at the top.

---

## Active escalations

(none)

---

## Resolved history

## 2026-10-01 04:10 – Escalation
**Raised by:** Refactor (audit of typecheck errors)
**Decision needed:** How should `code_auditor.scorecard` report a health score, given that its current value is fabricated?
**Context:** `src_local/psa/plugins/personas/audit_code_plugin.ts` calls
`ScoreCalculator.calculateHealth([], 100, 1.8)`. That method **has never existed** — not on the
current `ScoreCalculator`, not in the deleted `score_calculator.ts`, and not in any commit
(verified with `git log --all -S`). The call sits inside a `try` block around a **dynamic**
`await import(...)`, so `tsc` resolves the module but never type-checks the member. The call
therefore throws `TypeError` at runtime and the `catch` returns a **hardcoded
`healthScore: 100`**. The repository has been reporting a perfect audit score purely by
accident, and no gate could see it.

The faithful implementation lives one layer down:
`PhdGovernanceSystem.getInstance().calculateHealth({ files, alerts, totalFiles, avgComplexity })`
(`src_local/core/governance/system_facade.ts:41` → `scoring_engine.ts:7`).

**Why a human is needed:** every honest fix changes the tool's observable contract.
`tests/psa_pure_plugin_architecture.test.ts:119` asserts `healthScore >= 80`. Calling the real
implementation with the empty file list this tool currently passes returns **`0`**
(`scoring_engine.ts:9` early-returns on empty input), so the test fails. AGENTS.md §7.6 requires
escalation when a change alters tested behaviour.

**Options:**
- A) Keep the fabricated `100` and mark it clearly as a known defect (current state).
- B) Add a real `calculateHealth` to `ScoreCalculator` and make the plugin gather actual metrics
  before scoring — new behaviour, and the test expectation must be revisited.
- C) Make the tool report `status: "unavailable"` honestly instead of a fake score — moves the
  failure into the open and requires updating `psa_pure_plugin_architecture.test.ts:119`.

**Recommended:** **B**, but it is genuinely a product decision about what a "scorecard" with no
inputs should mean. Option A is only acceptable as a temporary, clearly-labelled state.
**Status:** RESOLVED 2026-10-01

**Resolution (option B, chosen by the maintainer):** implemented in
`src_local/engines/diagnostics/code_scorecard.ts` and wired into the plugin. The tool now scans the
workspace (skipping build/vendor/scratch dirs), derives `has_test` / `telemetry` / `purpose` /
complexity per file, and delegates to the canonical engine —
`PhdGovernanceSystem.getInstance().calculateHealth()` → `ScoringEngine`. The misleading `try/catch`
that returned a hardcoded `100` is gone; a failure now surfaces instead of being swallowed.

**Two things the investigation changed about the decision:**

1. **The honest score is 53.71, not 80.** Measured on the real tree (250 files, avg complexity 4.44):
   `stability 3.50` (only ~10% of modules are imported by a test), `purity 10.25`,
   `observability 4.05`, `security 15`, `excellence 5.86`, `compliance 15`. The old assertion
   `healthScore >= 80` was never a property of the code — it only ever passed because the value was
   fabricated. The new dedicated test therefore uses `> 50` as an explicit **regression guard**, and
   additionally asserts the tool agrees with `new ScoringEngine().calculateHealth(...)` so nobody can
   reintroduce a hand-rolled score. The `>= 80` aspiration was NOT silently lowered: it is tracked as
   a real gap in `state.md` (the same low test-coverage signal that drives the coverage debt).
2. **The plugin's own test was asserting nothing meaningful.** `psa_pure_plugin_architecture.test.ts`
   runs with an EMPTY scratch directory as `workspaceRoot`, so the real scorecard correctly reports 0
   (`ScoringEngine` early-returns on `totalFiles === 0`). That assertion now checks the honest empty
   contract (`healthScore === 0`, `emptyScope === true`), and real-code scoring is covered by the new
   `tests/code_scorecard.test.ts`. A scanner bug was also caught this way: matching tests by filename
   alone missed `veto_engine.ts`, which is covered by `governance_veto_engine.test.ts`; detection is
   now done by resolving the modules each test file actually imports.

Also removed the now-dead `ScoreCalculator` import path from the plugin.

---

## 2026-09-24 15:03 – Escalation
**Raised by:** Auto-merge Workflow
**Decision needed:** Fix test failures on PR #85
**Context:** bun test failed on PR #85.
**Options:** A) Fix failing tests B) Close PR
**Recommended:** A
**Status:** RESOLVED 2026-10-01
**Resolution:** Not a real test failure. This was a **false positive** caused by the auto-merge
workflow running `bun test` on a runner without the native `bin/` artifacts — the same defect that
affected every PR it evaluated. PR #85 was in fact merged by the maintainer (commit `14baadf`), so
the escalation was obsolete while still marked `PENDING HUMAN`. Root cause fixed on 2026-10-01: the
workflow no longer runs the suite and delegates validation to `ci.yml` via `gh pr merge --auto`.

## 2026-09-24 15:06 – Escalation
**Raised by:** Auto-merge Workflow
**Decision needed:** Fix test failures on PR #86
**Context:** bun test failed on PR #86.
**Options:** A) Fix failing tests B) Close PR
**Recommended:** A
**Status:** RESOLVED 2026-10-01
**Resolution:** Same false positive as PR #85. PR #86 was merged by the maintainer (commit
`b250920`). No test failure required human action.

## 2026-09-24 15:08 – Escalation
**Raised by:** Auto-merge Workflow
**Decision needed:** Fix test failures on PR #87
**Context:** bun test failed on PR #87.
**Options:** A) Fix failing tests B) Close PR
**Recommended:** A
**Status:** RESOLVED 2026-10-01
**Resolution:** Same false positive as PR #85. PR #87 was merged by the maintainer (commit
`1a5570c`). No test failure required human action.
