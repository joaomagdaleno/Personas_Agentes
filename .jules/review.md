Review's Journal
Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / Learning: ... / Action: ...

## 2026-09-15 - Scribe PR Code File Modification Detection
**Learning:** Scribe documentation PRs must strictly adhere to AGENTS.md §6 condition "(b) no code files touched". PR `scribe-polyglot-docs-boost-9792217807429720810` included doc comment additions in TypeScript (`src_local/psa/kernel/psa_events.ts`) and Zig micro-agents (`src_native/wasm_agents/*.zig`), which violates the auto-merge policy even if changes are only comments.
**Action:** Always run `git diff --stat origin/main..branch` for Scribe PRs to verify no non-`.md` code files are modified. If code files are touched, issue REQUEST CHANGES verdict and enqueue handoff in `queue.md`.
