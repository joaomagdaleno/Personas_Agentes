# Sentinel Security Journal

## 2026-09-12 - FFI Boundary Memory Safety & SQL Injection Parameterization
**Vulnerability:** Raw pointer dereferencing in C-ABI exports (`calculate_complexity` and `fast_hash`) in `src_native/analyzer/src/lib.rs` lacked `unsafe` function contract annotations (CWE-119 / CWE-242), and `MemoryPruningAgent` interpolated string inputs into SQLite query strings (`DELETE FROM health_history WHERE timestamp < ...`) (CWE-89).
**Learning:** In polyglot architectures, native C-ABI exports must explicitly mandate `unsafe extern "C"` function contracts to prevent undefined behavior when dereferencing raw pointers passed from FFI runtimes like Bun:FFI. In addition, automated SQLite maintenance routines must consistently use parameterized queries even when computing date/time expressions.
**Prevention:** Mark all C-ABI FFI entry points dereferencing raw pointers as `unsafe extern "C"` and use prepared statement parameters (`?`) for all SQLite queries.
