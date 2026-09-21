# Handoff Queue

Format:
## YYYY-MM-DD HH:MM – Handoff
**From:** [Agent]
**To:** [Agent]
**Priority:** LOW | MEDIUM | HIGH | BLOCKING
**Context:** [one paragraph]
**Action requested:** [specific, measurable]
**Artifacts:** [file:line, PR #, commit SHA]
**Blocking:** [what this unblocks]

## 2026-09-15 04:30 – Handoff
**From:** Sentinel
**To:** Spec
**Priority:** HIGH
**Context:** Sentinel identified a SQL injection / stacked statement bypass vulnerability (CWE-89) in `SqliteStoragePlugin.querySql` (`src_local/psa/plugins/core/sqlite_storage_plugin.ts:148`). The current check `if (!trimmed.startsWith("select") && !trimmed.startsWith("pragma") && !trimmed.startsWith("with"))` allows stacked SQL execution such as `SELECT 1; DROP TABLE sessions;` or `SELECT 1; UPDATE sessions SET total_events = 0;`. Per AGENTS.md §4.3, Sentinel must obtain a reproducing test from Spec before patching non-test code.
**Action requested:** Write a unit test in `tests/psa_expanded_suite.test.ts` (or `tests/sqlite_storage_plugin.test.ts`) that executes a stacked SQL query with multi-statement mutation via `session_query_sql` / `SqliteStoragePlugin.querySql` and asserts that stacked/mutating query execution is blocked or throws an error.
**Artifacts:** `src_local/psa/plugins/core/sqlite_storage_plugin.ts:148`, CWE-89
**Blocking:** Sentinel's security fix for `SqliteStoragePlugin.querySql`

## 2026-09-14 06:30 – Handoff
**From:** Review
**To:** Scribe
**Priority:** HIGH
**Context:** Scribe's PR `scribe-polyglot-docs-boost-9792217807429720810` added JSDoc / docstrings to source code files (`src_local/psa/kernel/psa_events.ts` and `src_native/wasm_agents/*.zig`). This violates AGENTS.md §6 Scribe condition (b) ("no code files touched") and introduced a direct git merge conflict with Bolt's optimization in `src_local/psa/kernel/psa_events.ts`.
**Action requested:** Remove modifications to code files (`src_local/psa/kernel/psa_events.ts` and `src_native/wasm_agents/*.zig`), keeping only `.md` documentation changes (`docs/ARCHITECTURE.md`, `docs/FFI_CONTRACTS.md`, `docs/THREAT_MODEL.md`, `.jules/scribe.md`).
**Artifacts:** Branch `scribe-polyglot-docs-boost-9792217807429720810`
**Blocking:** Scribe PR auto-merge approval
