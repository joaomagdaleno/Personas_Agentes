# PSA Autonomous Agent Ecosystem

This directory contains the shared state of six autonomous agents that improve the PSA codebase.

## Files

- `state.md` — shared blackboard (read before acting, write after acting)
- `queue.md` — handoffs between agents
- `escalations.md` — decisions that require a human
- `bolt.md`, `spec.md`, `sentinel.md`, `scribe.md`, `refactor.md`, `architect.md`, `review.md` — each agent's private journal
- `prompts/` — the prompt for each Scheduled Task (copy into the Jules dashboard)
- `rounds/` — weekly summaries

## Agents

- Review 👁️ – independent PR review (never merges, only signals)

## How it works

Each agent runs on a Jules Scheduled Task (see `AGENTS.md` §8). It reads `state.md`, does ONE thing, updates `state.md`, and exits. Communication is asynchronous via files.

The repo currently has 186 passing tests. They are the safety net for every agent action.

## For the human

- Review `.jules/escalations.md` once a week (< 30 min).
- Approve/reject by editing the file inline (`**Status:** APPROVED: A`).
- Spot-check PRs labeled `auto-merged`.

## Setup (one-time, in the Jules dashboard)

1. Create 6 Scheduled Tasks (one per agent) with the prompts from `.jules/prompts/`.
2. Set the times per `AGENTS.md` §8.
3. Add secret `JULES_API_KEY` in GitHub → Settings → Secrets → Actions.
4. Verify the workflows in `.github/workflows/` are enabled.

## How to dispatch an issue to Jules

1. Open an issue describing the task.
2. Add the label `jules`.
3. The workflow `.github/workflows/jules-on-issue.yml` fires and sends the issue to a Jules session.
4. Jules reads `AGENTS.md` and routes to the right agent.
5. A PR appears (auto-merged if it meets §6).
