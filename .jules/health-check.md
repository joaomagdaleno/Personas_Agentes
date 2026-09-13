# Ecosystem Health Check Template (Weekly – 10 Minutes)

This checklist is used by human maintainers to perform a 10-minute weekly health audit of the PSA autonomous agent ecosystem.

---

## Weekly Checklist

### 1. Escalations Audit (`.jules/escalations.md`)
- [ ] Review pending items marked `STATUS: PENDING HUMAN`.
- [ ] Resolve or acknowledge any human-in-the-loop decisions (security fixes, dependency additions, architecture decisions).
- [ ] Clear resolved escalation entries.

### 2. File Lock & State Health (`.jules/state.md`)
- [ ] Check `Active work-in-progress` table for agents stuck in `active` state for > 48 hours.
- [ ] Check `File locks` table for active locks. Verify no lock exceeds 24 hours.
- [ ] Review `Known risks` section for auto-cleared stale locks or conflict notes.

### 3. Handoff Queue TTL (`.jules/queue.md`)
- [ ] Check pending handoffs in `.jules/queue.md`.
- [ ] Verify no handoffs older than 72 hours remain unaddressed or un-escalated.

### 4. Auto-Merged PR Spot-Check
- [ ] Review recent PRs auto-merged with label `auto-merged`.
- [ ] Verify test suite passes on main branch (`bun test`).
- [ ] Check that Review agent emitted `APPROVE` verdicts for merged PRs.

### 5. Round Summary Review (`.jules/rounds/`)
- [ ] Read current week's summary round doc (`.jules/rounds/YYYY-WNN.md`).
- [ ] Verify ecosystem overall health score and performance metrics.

---

## Log of Execution

| Date (YYYY-MM-DD) | Auditor | Items Actioned | Status (OK / Action Required) |
|-------------------|---------|----------------|--------------------------------|
| YYYY-MM-DD        | Name    | Summary        | OK                             |
