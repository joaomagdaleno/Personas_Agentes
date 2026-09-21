Review's Journal
Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-16 - Batch Review Disambiguation for Merged PRs vs Direct Main Commits
**Learning:** During daily Review batch runs, agents or maintainers may directly merge PRs or push commits to main between schedule slots. Checking `git log --oneline -n 10` alongside remote branches prevents false-positive warnings about missing PR reviews when PRs are already merged onto main.
**Action:** Always cross-reference open PR candidate branches against `git log main` to confirm whether a PR was merged or remains open before logging batch counts in `.jules/state.md`.

## 2026-09-14 - Scribe Code File Changes Violating Auto-Merge & Conflicting Hot Paths
**Learning:** Scribe attempted to add inline doc comments to source files (`psa_events.ts` and `*.zig`). Even though the changes were documentation comments, modifying code files violates AGENTS.md §6 Scribe condition (b) ("no code files touched") and created a merge conflict with Bolt's concurrent EventBus hot-path optimization.
**Action:** Always enforce strict checking of `git diff --stat` for Scribe PRs to ensure zero `.ts`, `.zig`, or `.rs` files are modified, preventing merge conflicts with active performance and feature PRs.
