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
