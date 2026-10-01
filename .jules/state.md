# PSA Ecosystem – Shared State

## Last updated
2026-10-01 04:40 UTC by Sovereign Automation

## Health snapshot
- **Tests: 324/324 passing (0 failures across 85 test suites)** — this is the authoritative test baseline referenced by AGENTS.md §4.5
- System Health Score: 86% (verified by Go Hub & Rust Sidecar)
- **Typecheck: `bun x tsc --noEmit` reports 0 errors** (was 63 on 2026-10-01)
- Coverage: 64.29% lines / 52.19% funcs overall (see `Known risks`)
- Open critical vulns: 0
- Idris 2 proofs: PASSING
- Public APIs documented: 45%
- Median test runtime: ~35s (requires a fully populated `bin/`; ~205s with 13 failures without it)

## Active work-in-progress
| Agent | Task | Files locked | Status |
|---|---|---|---|
| Spec | Completed PsaPluginLoader unit test suite (PR #94 merged) | none | idle |
| Bolt | Completed VetoEngine zero-allocation path lookup (PR #93 merged) | none | idle |
| Sentinel | Ready for SqliteStoragePlugin stacked query validation fix | none | idle |
| Scribe | Queued: MD022 heading compliance in docs/ and auto_healing reports | none | idle |
| Refactor | Queued: Reduce nesting depth <= 3 in pyramid_analyst.ts & PurityScorer.ts | none | idle |
| Architect | — | — | idle |
| Review | PRs #93 and #94 approved and integrated: 324 tests active | none | idle |

## File locks
| File | Locked by | Since | Reason |
|---|---|---|---|
| — | — | — | — |

## Recently completed
- 2026-10-01: **Largest coverage gain of the project: 45 dead test files made live. Baseline 211 -> 324 tests.** All 45 `src_local/**/*.test.ts` files were relocated to `tests/` mirroring the source tree, with every static and dynamic relative import re-resolved for the new depth. They had NEVER run, because `bunfig.toml` scopes `bun test` to `tests/`. Result: **+113 test cases, +45 suites, coverage 60.56% -> 64.29% lines and 46.25% -> 52.19% funcs**, measured, with zero new failures. `tests/activate-phase.test.ts` and `tests/psa_pure_plugin_architecture.test.ts` were already in place and untouched. Note: the moved files include 11 suites whose only assertions are `.toBeDefined()` (smoke) and 4 auto-generated "Parity Healer" stubs that assert nothing (`expect(true).toBe(true)`) — they were moved rather than deleted so no decision was made silently, but they add count without coverage and are candidates for pruning.
- 2026-10-01: **Test baseline number de-hardcoded.** The baseline was written literally in 4 places (AGENTS.md §4.5/§6/§7.6 and 7 agent prompts), which is how it drifted from 207 to 211 unnoticed. AGENTS.md now defines the baseline as "the count recorded in `.jules/state.md`", and every prompt instructs the agent to read that file as authoritative. Current value: 324.
- 2026-10-01: **Typecheck driven to zero (63 → 0 errors).** Root cause was a single destructive commit, `24ed7a5` (2026-08-12), which deleted **113 `.ts` files** and left stale imports behind for six weeks. Nothing caught it because `bunfig.toml` restricts `bun test` to `tests/`, so the 45 `src_local/**/*.test.ts` files are never executed, and because `bun test` never typechecks. Fixes: restored `safety_identifiers.ts` / `safety_patterns.ts` / `safety_definitions.ts` (these unblocked `safety_supreme_judge.ts`, the security judge, plus 3 other files); restored `StructuralAnalyst.analyze_intent()` and `.integrityGuardian` which the consolidation had dropped; repointed `infrastructure_assembler.ts` to the consolidated services (its 3 imports were 1-line alias barrels deleted in `24ed7a5`); added missing imports (`fs`, `Path`, `DependencyHelpers`, `SovereignResourceBudget`); renamed 3 phantom symbols (`BaseResourceGovernor` → `ResourceGovernorStrategy`, which never existed under the old name); fixed `join(` → `path.join(`; captured `activeTurnControllers` (a class member unreachable inside the `async fetch(req)` shorthand); registered `"resource:mode_changed"` in `SystemEventMap`; removed a bare `export { … }` with no module source in `strategic_cognitive_architect_service.ts`; repointed `sessions.createSession(...)` → `sessions.create({…})`; added `GitClient.isDirty()`/`status()`; fixed the `Bun.CryptoHasher | crypto.Hash` union in `download_model.ts` (typing only — the SHA-256 path is byte-identical); added the missing `projectRoot` argument to two constructors in `benchmark.ts`; corrected `DatabaseHub.query(...)` to materialise the Statement with `.get()`; fixed 5 orphan test files; deleted the unreachable `src_local/utils/ai/test_predictor.ts`.
- 2026-10-01: **Baseline corrected 207 -> 211** (verified: 211 test declarations across 40 files, 211/211 passing). The `207` figure had been stale since before commit `a60574c`.
- 2026-10-01: **Fixed build-breaking duplicate declarations in `src_local/core/governance/veto_engine.ts`.** Commit `a60574c` merged PR #93 and PR #94 keeping BOTH versions of the module constants (`TECH_TERMS_REGEX`, `MONEY_TERMS`, `RULE_KEYWORDS` declared twice) plus dead `private static readonly` fields. The file did not compile, which broke 4 tools (`system.health_score`, `audit.obfuscation_scan`, `healing.run_auto_heal`, `native.governance_status`) and invalidated the coverage measurement. Removed the duplicates (-34 lines); `tsc` now clean.
- 2026-10-01: **Auto-merge workflow no longer runs `bun test`.** It delegated nothing and always failed because `bin/` (64 native artifacts, gitignored) is absent on clean runners. Validation is now delegated to `ci.yml` via `gh pr merge --auto`; the workflow never checks out PR code (API-only inspection). Inviolable §4.4/§4.6 checks preserved.
- 2026-10-01: **State files reconciled.** `escalations.md` had 3 entries marked `PENDING HUMAN` for PRs #85/#86/#87 that the maintainer had already merged on 2026-09-24 (commits `14baadf`, `b250920`, `1a5570c`) — they were false positives from the broken auto-merge workflow, now marked `RESOLVED` with evidence and moved to a `Resolved history` section. `queue.md` reorganized into open vs resolved; the MD022 handoff to Scribe is verified complete, the nesting-depth handoff to Refactor is still open and is blocked by the coverage floor (§4 rules 1-2).
- 2026-09-24: PR #94 integrated: Spec delivered 8 unit tests for PsaPluginLoader (42% -> 100% coverage).
- 2026-09-24: PR #93 integrated: Bolt optimized VetoEngine path checking with zero-allocation character scanning.
- 2026-09-22: PR #90 integrated: Bolt optimized PsaEventBus waterfall allocation and fast-path execution.
- 2026-09-22: PR #89 integrated: Spec merged 4 new unit & security tests for SqliteStoragePlugin (CWE-89).
- 2026-09-22: System diagnostic unmasked and repaired end-to-end: authentic 86% Health Score established.
- 2026-09-22: Hardware-adaptive SLM resource budget implemented (CPU inference down from 32s to 3.7s).

## Known risks
- **Coverage debt (HIGH).** Real coverage is **61.27% lines / 47.18% funcs**, not the 85.30% previously recorded here. That figure was produced by a run whose build was broken, which inflated the ratio by dropping the files that failed to load. Per AGENTS.md §4 rules 1-2 (threshold 80% lines), **Bolt and Refactor are currently blocked from acting on the majority of the codebase** and must hand off to Spec. Closing this gap is the highest-value Spec work available.
- **Coverage measurement depends on a populated `bin/`.** Running `bun test --coverage` without the 64 native artifacts under `bin/` yields 13 false failures and an invalid coverage number. Nothing in the repository rebuilds the full `bin/` set (`scripts/ensure_binaries.ts` builds only the Rust analyzer and Go hub; `native-build.yml` only produces analyzer and scanner). Any agent reporting coverage must confirm `bin/` is complete first.
- **Auto-merge requires branch protection.** `gh pr merge --auto` only waits for required checks if branch protection on `main` requires the `ci.yml` status check. Until that is configured in repository settings, the workflow labels PRs `auto-merged` without a real gate.
- **Stale test scratch directories (FIXED in source).** `tests/psa_additional_tools.test.ts` created `.psa_test_scratch_*` directories with **no `afterEach` cleanup** — it was the single largest source of accumulated scratch dirs (31 were found and removed on 2026-10-01). An `afterEach` cleanup has been added. `psa_expanded_suite.test.ts` and `psa_pure_plugin_architecture.test.ts` already had cleanup, though `psa_pure_plugin_architecture` can still leave a directory behind when a test fails before teardown.
- **`src_native/hub/hub.exe` is tracked in git (24.9 MB).** `.gitignore` line 52 has `*.exe`, so this binary is tracked *despite* the rule — it was committed before that pattern was added. It bloats clone size permanently (git history) and is a build artifact that `go build -o hub.exe main.go` regenerates. Removing it (`git rm --cached`) is safe for builds but rewrites nothing in history; left in place here because it changes what a clean checkout contains and that call belongs to the maintainer.
- **Intermittent `CompactionPlugin` failure under full-suite runs.** `compaction_plugin.test.ts` runs a SQLite `VACUUM` against the shared `system_vault.db`; under a full-suite run it can intermittently fail on database contention (observed once in 4 consecutive runs on 2026-10-01, never in isolation). It is not a code defect — re-run before escalating. If recurring, the fix is to point the test at its own database file instead of the shared vault.
- **`bun test --coverage` numbers are only trustworthy with a complete `bin/`.** See the coverage risk above. The historical 85.30% figure was produced by a build-broken run and should not be used as a baseline for any agent decision.
