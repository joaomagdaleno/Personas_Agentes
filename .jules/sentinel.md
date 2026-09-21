# Sentinel's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-15 - SqliteStoragePlugin Stacked Query Validation Vulnerability (CWE-89)
**Vulnerability:** `SqliteStoragePlugin.querySql` in `src_local/psa/plugins/core/sqlite_storage_plugin.ts` validates read-only queries using `trimmed.startsWith("select")`. This string prefix check fails to prevent stacked multi-statement execution (e.g., `SELECT 1; DROP TABLE sessions;`), allowing arbitrary state modification via SQLite.
**Learning:** String prefix validation on SQL queries in Bun/Node runtimes is susceptible to stacked statement injection unless queries are parsed, stripped of trailing semicolons/stacked statements, or verified to contain no statement terminators or mutating commands. Per AGENTS.md §4.3, fixing non-test code requires requesting a reproducing test from Spec first.
**Prevention:** Hand off security findings to Spec before patching non-test source code, and strictly disallow multi-statement query strings or semicolons in raw read-only SQL query tools.

## 2026-09-15 - Polyglot Security Baseline Audit Verification
**Vulnerability:** Comprehensive multi-layer security scan verified zero active critical vulnerabilities in gRPC/mTLS, WASM sandbox isolation, SQLite parameterized queries, or Idris 2 formal proofs.
**Learning:** Resolving missing node dependencies (`bun install winston`) restored full test suite execution (186/186 tests passing). Go gRPC hub (`go vet`) passed without findings, while Rust analyzer (`cargo clippy`) highlighted style cleanup items.
**Prevention:** Always verify polyglot toolchains and dependencies as the first mandatory action during Sentinel sessions.

## 2026-09-14 - Sovereign Security Baseline Verification & Polyglot Tooling Audit
**Vulnerability:** Audit of external cloud failover in `LocalSLMEngine` confirmed zero Google Gemini API usage or data leakage, with strict fallback logic. `SecurityCloudPlugin` actively filters dangerous shell patterns (`process.exit`, `rm -rf /`, `drop database`).
**Learning:** Security posture across Bun micro-kernel (186/186 tests passing), Go gRPC hub (`go vet` passing), and WASM micro-agents remains intact. Cargo clippy output highlights Rust SIMD compiler warnings in `analyzer/`, but FFI memory safety contracts are maintained.
**Prevention:** Continuously run layer-specific security baseline verification on every Sentinel run before attempting patches.

## 2026-09-12 - FFI Boundary Memory Safety & SQL Injection Parameterization
**Vulnerability:** Raw pointer dereferencing in C-ABI exports (`calculate_complexity` and `fast_hash`) in `src_native/analyzer/src/lib.rs` lacked `unsafe` function contract annotations (CWE-119 / CWE-242), and `MemoryPruningAgent` interpolated string inputs into SQLite query strings (`DELETE FROM health_history WHERE timestamp < ...`) (CWE-89).
**Learning:** In polyglot architectures, native C-ABI exports must explicitly mandate `unsafe extern "C"` function contracts to prevent undefined behavior when dereferencing raw pointers passed from FFI runtimes like Bun:FFI. In addition, automated SQLite maintenance routines must consistently use parameterized queries even when computing date/time expressions.
**Prevention:** Mark all C-ABI FFI entry points dereferencing raw pointers as `unsafe extern "C"` and use prepared statement parameters (`?`) for all SQLite queries.
