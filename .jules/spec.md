# Spec's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-10 - Default Models Registration Parity in PsaLLMService & /v1/models
**Learning:** `PsaLLMService` model registration is the single source of truth for available SLM models across both the engine and HTTP/SSE endpoints (`/v1/models`). Missing model definitions like `qwen2.5-coder-7b` in `registerDefaultModels()` cause model lookups and E2E list checks to fail.
**Action:** Ensure all default models (`qwen2.5-coder-1.5b`, `qwen3-8b-thinking`, `qwen2.5-coder-7b`, and aliases) are registered upon `PsaLLMService` initialization and verified by unit/E2E test suites.

## 2026-09-17 - Spying on HubManagerGRPC Singleton Methods
**Learning:** `GoHubPlugin` relies on `HubManagerGRPC.getInstance()` singleton for native gRPC communications. Spying directly on the singleton instance using `spyOn(HubManagerGRPC.getInstance(), "isHealthy")` and `spyOn(HubManagerGRPC.getInstance(), "getKnowledgeGraph")` enables clean isolation of plugin behavior without needing native Go process execution during unit tests.
**Action:** Always mock singleton backend methods via `spyOn(Instance, "method")` and restore them in `finally` blocks to maintain isolation and prevent side-effects in subsequent tests.

## 2026-09-14 - Uncovered VetoEngine Heuristic Classification
**Learning:** `VetoEngine` contains domain-specific heuristic filters (`isTechnicalMath` and `isRuleDefinition`) that differentiate false-positive math expressions from monetary balance issues and detect rule definition patterns in code scanning.
**Action:** When testing governance modules, ensure heuristic boundary conditions (e.g. presence of financial terms suppressing math heuristics) are explicitly covered.

## 2026-09-22 - Dynamic Plugin Hot-Reload Unregistration Verification
**Learning:** When testing dynamic plugin hot-reloading (`PsaPluginLoader.reloadPlugin`), reloading a plugin with a new file requires specifying a distinct plugin file or updated class definition. `PsaPluginRegistry.unregister` automatically cleans up tools registered by the old plugin instance, ensuring tool map integrity across hot-reloads.
**Action:** In dynamic plugin loader tests, verify that tools from unregistered plugins are removed from `PsaContext.tools` upon reload or unregistration.
