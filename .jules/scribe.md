# Scribe's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-21 - Operational Troubleshooting Guide & Multi-Language Diagnostic Procedures
**Gap:** Developers and operators lacked unified diagnostic procedures for resolving memory pressure in SLM Warm-Purge, diagnosing Go Hub gRPC mTLS handshakes, handling WASM sandbox budget limits, and debugging Idris 2 mathematical proof rejections.
**Learning:** Documenting concrete diagnostic commands (`bun run download-model --model 1.5b`, `bun run ensure-binaries`, `bun run scripts/build_wasm.ts`) and root causes in `docs/TROUBLESHOOTING.md` significantly accelerates failure recovery in local and CI environments.
**Action:** When documenting sovereign polyglot operations, group sections by failure domain and pair every symptom with immediate reproducible resolution commands.

## 2026-09-14 - Polyglot Documentation Surface Baseline & Architectural Flow Diagrams
**Gap:** Polyglot architectural interactions across C# WinUI 3, Bun TypeScript, Rust SIMD, Go Native Hub, Zig WASM micro-agents, and Idris 2 formal safety proofs lacked unified sequence diagrams and cross-language contract specifications.
**Learning:** In a 6-language sovereign architecture, sequence diagrams (Mermaid) bridging IPC channels (gRPC/mTLS, C-ABI FFI, WASI sandbox buffers, and dependent type verifier specifications) dramatically reduce onboarding complexity and clarify local execution guarantees.
**Action:** Always maintain sequence/flow diagrams in `docs/ARCHITECTURE.md`, explicit C-ABI pointer safety contracts in `docs/FFI_CONTRACTS.md`, and cryptographic verification rules in `docs/THREAT_MODEL.md`.
