# Spec's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-10 - Default Models Registration Parity in PsaLLMService & /v1/models
**Learning:** `PsaLLMService` model registration is the single source of truth for available SLM models across both the engine and HTTP/SSE endpoints (`/v1/models`). Missing model definitions like `qwen2.5-coder-7b` in `registerDefaultModels()` cause model lookups and E2E list checks to fail.
**Action:** Ensure all default models (`qwen2.5-coder-1.5b`, `qwen3-8b-thinking`, `qwen2.5-coder-7b`, and aliases) are registered upon `PsaLLMService` initialization and verified by unit/E2E test suites.

## 2026-09-14 - Uncovered VetoEngine Heuristic Classification
**Learning:** `VetoEngine` contains domain-specific heuristic filters (`isTechnicalMath` and `isRuleDefinition`) that differentiate false-positive math expressions from monetary balance issues and detect rule definition patterns in code scanning.
**Action:** When testing governance modules, ensure heuristic boundary conditions (e.g. presence of financial terms suppressing math heuristics) are explicitly covered.

## 2026-09-20 - Testing GoHubPlugin gRPC Spies & Knowledge Graph Fallback
**Learning:** `GoHubPlugin` dynamically imports `HubManagerGRPC` on tool invocation, requiring `spyOn(HubManagerGRPC, "getInstance")` in tests to intercept singleton resolution and test both healthy/degraded `native.hub_status` and fallback responses for `native.hub_knowledge_graph` when gRPC transport fails.
**Action:** Mock `HubManagerGRPC.getInstance()` returning controlled stub instances when testing native gRPC bridge plugins to prevent physical socket binding attempts.
