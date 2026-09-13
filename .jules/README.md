# PSA Autonomous Agent Ecosystem

This directory contains the shared state of six autonomous agents that improve the PSA codebase.

## Files

- `state.md` — shared blackboard (read before acting, write after acting)
- `queue.md` — handoffs between agents
- `escalations.md` — decisions that require a human
- `bolt.md`, `spec.md`, `sentinel.md`, `scribe.md`, `refactor.md`, `architect.md` — each agent's private journal
- `prompts/` — the prompt for each Scheduled Task (copy into the Jules dashboard)
- `rounds/` — weekly summaries

## How it works

Each agent runs on a Jules Scheduled Task (see `AGENTS.md` §8). It reads `state.md`, does ONE thing, updates `state.md`, and exits. Communication is asynchronous via files.

The repo currently has 186 passing tests. They are the safety net for every agent action.

## For the human

- Review `.jules/escalations.md` once a week (< 30 min).
- Approve/reject by editing the file inline (`**Status:** APPROVED: A`).
- Spot-check PRs labeled `auto-merged`.

## Setup (one-time, in the Jules dashboard)

1. Create Scheduled Tasks for the agents with the prompts from `.jules/prompts/`.
2. Set the times per `AGENTS.md` §8.
3. Add secret `JULES_API_KEY` in GitHub → Settings → Secrets → Actions.
4. Verify the workflows in `.github/workflows/` are enabled.

## How auto-merge and review work

1. Agents produce PRs throughout the day and label eligible ones `auto-merged`.
2. At 06:00 UTC, the **Review agent** inspects all open PRs labeled `auto-merged` in batch mode, verifying them against `AGENTS.md` §6.
3. At 07:00 UTC, the scheduled auto-merge workflow (`.github/workflows/auto-merge-agent-prs.yml`) runs tests on each remaining `auto-merged` PR, approves, and squash-merges it.
