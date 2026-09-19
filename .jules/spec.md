# Spec's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-10 - Default Models Registration Parity in PsaLLMService & /v1/models
**Learning:** `PsaLLMService` model registration is the single source of truth for available SLM models across both the engine and HTTP/SSE endpoints (`/v1/models`). Missing model definitions like `qwen2.5-coder-7b` in `registerDefaultModels()` cause model lookups and E2E list checks to fail.
**Action:** Ensure all default models (`qwen2.5-coder-1.5b`, `qwen3-8b-thinking`, `qwen2.5-coder-7b`, and aliases) are registered upon `PsaLLMService` initialization and verified by unit/E2E test suites.

## 2026-09-14 - Uncovered VetoEngine Heuristic Classification
**Learning:** `VetoEngine` contains domain-specific heuristic filters (`isTechnicalMath` and `isRuleDefinition`) that differentiate false-positive math expressions from monetary balance issues and detect rule definition patterns in code scanning.
**Action:** When testing governance modules, ensure heuristic boundary conditions (e.g. presence of financial terms suppressing math heuristics) are explicitly covered.

## 2026-09-19 - WorkspaceRoot Dependency in RegistryManager & PsaSystemControlPlugin Unit Testing
**Learning:** `RegistryManager` loads stack files from `agents_registry/*.json` relative to `PsaContext`'s `workspaceRoot`. When initializing `PsaContext` with isolated temporary folders, `agents_registry` must either be populated or `workspaceRoot` must point to the repository root for catalog tools like `registry.get_agent_info` to find indexed agent metadata (such as `bolt`, `scribe`, `sentinel`).
**Action:** In plugin unit tests requiring `agents_registry` data, pass `path.resolve(".")` as `workspaceRoot` to `PsaContext` while creating separate temporary directories for file outputs.
