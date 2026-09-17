# Sentinel's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-15 - Polyglot Security Baseline Audit Verification
**Vulnerability:** Comprehensive multi-layer security scan verified zero active critical vulnerabilities in gRPC/mTLS, WASM sandbox isolation, SQLite parameterized queries, or Idris 2 formal proofs.
**Learning:** Executing `bun install` restored all missing workspace node dependencies (`winston`), elevating overall test suite passing score to 189/189 tests passing. Go gRPC hub (`go vet ./...`) passed with zero warnings/errors.
**Prevention:** Always verify polyglot toolchains and package installation state as the first mandatory action during Sentinel sessions before declaring baseline status.

## 2026-09-14 - Sovereign Security Baseline Verification & Polyglot Tooling Audit
**Vulnerability:** Audit of external cloud failover in `LocalSLMEngine` confirmed zero Google Gemini API usage or data leakage, with strict fallback logic. `SecurityCloudPlugin` actively filters dangerous shell patterns (`process.exit`, `rm -rf /`, `drop database`).
**Learning:** Security posture across Bun micro-kernel (186/186 tests passing), Go gRPC hub (`go vet` passing), and WASM micro-agents remains intact. Cargo clippy output highlights Rust SIMD compiler warnings in `analyzer/`, but FFI memory safety contracts are maintained.
**Prevention:** Continuously run layer-specific security baseline verification on every Sentinel run before attempting patches.

## 2026-09-12 - FFI Boundary Memory Safety & SQL Injection Parameterization
**Vulnerability:** Raw pointer dereferencing in C-ABI exports (`calculate_complexity` and `fast_hash`) in `src_native/analyzer/src/lib.rs` lacked `unsafe` function contract annotations (CWE-119 / CWE-242), and `MemoryPruningAgent` interpolated string inputs into SQLite query strings (`DELETE FROM health_history WHERE timestamp < ...`) (CWE-89).
**Learning:** In polyglot architectures, native C-ABI exports must explicitly mandate `unsafe extern "C"` function contracts to prevent undefined behavior when dereferencing raw pointers passed from FFI runtimes like Bun:FFI. In addition, automated SQLite maintenance routines must consistently use parameterized queries even when computing date/time expressions.
**Prevention:** Mark all C-ABI FFI entry points dereferencing raw pointers as `unsafe extern "C"` and use prepared statement parameters (`?`) for all SQLite queries.
