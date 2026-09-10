# Spec's Quality Journal

## 2026-09-10 - Default Models Registration Parity in PsaLLMService & /v1/models
**Learning:** `PsaLLMService` model registration is the single source of truth for available SLM models across both the engine and HTTP/SSE endpoints (`/v1/models`). Missing model definitions like `qwen2.5-coder-7b` in `registerDefaultModels()` cause model lookups and E2E list checks to fail.
**Action:** Ensure all default models (`qwen2.5-coder-1.5b`, `qwen3-8b-thinking`, `qwen2.5-coder-7b`, and aliases) are registered upon `PsaLLMService` initialization and verified by unit/E2E test suites.
