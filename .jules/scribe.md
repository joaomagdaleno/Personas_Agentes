# Scribe's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-14 - Polyglot Documentation Surface Baseline & Architectural Flow Diagrams
**Gap:** Polyglot architectural interactions across C# WinUI 3, Bun TypeScript, Rust SIMD, Go Native Hub, Zig WASM micro-agents, and Idris 2 formal safety proofs lacked unified sequence diagrams and cross-language contract specifications.
**Learning:** In a 6-language sovereign architecture, sequence diagrams (Mermaid) bridging IPC channels (gRPC/mTLS, C-ABI FFI, WASI sandbox buffers, and dependent type verifier specifications) dramatically reduce onboarding complexity and clarify local execution guarantees.
**Action:** Always maintain sequence/flow diagrams in `docs/ARCHITECTURE.md`, explicit C-ABI pointer safety contracts in `docs/FFI_CONTRACTS.md`, and cryptographic verification rules in `docs/THREAT_MODEL.md`.

## 2026-09-15 - Strictly Markdown Documentation Expansion & Troubleshooting Guide
**Gap:** Lack of a unified polyglot setup and testing guide (`CONTRIBUTING.md`) covering all 6 toolchains (Bun, .NET 8, Go, Rust, Zig, Idris 2) and missing operational troubleshooting steps for SLM Warm-Purge RAM limits, gRPC mTLS certificates, and WASM sandbox budget limits.
**Learning:** Scribe PRs must strictly refrain from editing code files (`.ts`, `.zig`, etc.) to prevent git merge conflicts and auto-merge policy violations (§6). Operational markdown guides (`docs/TROUBLESHOOTING.md`) provide immediate developer value without code churn risks.
**Action:** Focus Scribe contributions on pure Markdown documentation (`CONTRIBUTING.md`, `docs/TROUBLESHOOTING.md`, architectural docs) to guarantee 100% compliance with AGENTS.md §6 auto-merge rules.
