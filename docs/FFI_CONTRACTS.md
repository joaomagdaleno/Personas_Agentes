# Foreign Function Interface (FFI) & IPC Contracts

This document specifies the memory marshalling, data transfer formats, and safety guarantees across the polyglot language boundaries in Personas_Agentes (PSA).

---

## 1. Bun TypeScript ↔ Rust SIMD Analyzer (`bun:ffi` / C-ABI)

### Boundary Architecture
- **Language Pair:** TypeScript (Bun runtime) ↔ Rust SIMD (`analyzer.dll` / `libanalyzer.so`)
- **Transport Mechanism:** C-ABI dynamic library loading via Bun's native FFI (`bun:ffi`).
- **Target File:** `src_native/analyzer/src/lib.rs` / `src_local/psa/plugins/native/rust_simd_plugin.ts`

### Exported C-ABI Functions

#### `calculate_complexity`
Calculates cyclomatic complexity for code buffers directly in memory using SIMD/fast pattern matching.

```c
int32_t calculate_complexity(const char* code_ptr);
```

- **Pointer Contract (CWE-119 / CWE-242 Safety):**
  - `code_ptr` must be a valid null-terminated UTF-8 C string or `NULL`.
  - If `code_ptr` is `NULL` or invalid UTF-8, Rust returns `1` safely without dereferencing invalid memory or panicking.
- **Memory Ownership:** Memory allocated by Bun (via `Buffer.from(code + "\0")`). Rust performs read-only access and never deallocates `code_ptr`.

#### `fast_hash`
Computes 64-bit FNV1a hash of a code string for fast duplicate detection.

```c
uint64_t fast_hash(const char* code_ptr);
```

- **Pointer Contract:**
  - `code_ptr` must be a valid null-terminated UTF-8 C string or `NULL`.
  - If `code_ptr` is `NULL`, returns `0` safely.
- **Memory Ownership:** Read-only access by Rust; owned and freed by Bun.

---

## 2. Bun TypeScript ↔ Zig Native FFI Shared Library

### Boundary Architecture
- **Language Pair:** TypeScript (Bun) ↔ Zig (`analyzer.dll` / `libzig_analyzer.so`)
- **Transport Mechanism:** `bun:ffi` C-ABI dynamic library loading with TypeScript fallback.
- **Target File:** `src_native/zig_analyzer/analyzer.zig`

### Safety Contract
- Native compilation managed automatically by `scripts/ensure_binaries.ts`.
- Memory passed from TypeScript must be null-terminated C strings.
- Graceful fallback to pure TypeScript AST analysis if the native shared library fails to load on target architecture.

---

## 3. Bun TypeScript ↔ WASM WASI Micro-Agents (Zig Bytecode)

### Boundary Architecture
- **Language Pair:** TypeScript (Bun WASI engine) ↔ Zig Compiled WebAssembly (`bin/wasm/agent_*.wasm`)
- **Transport Mechanism:** WebAssembly Instance Memory (`WebAssembly.Memory`) with WASI sandbox containment.
- **Target Files:** `src_native/wasm_agents/*.zig`, `src_local/engines/maintenance/sovereign_resource_budget.ts`

### Memory Marshalling Protocol
1. **Instantiation:** Bun creates an isolated `WebAssembly.Instance` with an initial linear memory allocation (typically 1-2 pages / 64KB - 128KB).
2. **Buffer Writing:** Input source code or JSON payloads are encoded into UTF-8 uint8 arrays and written into the linear WebAssembly memory buffer at exported address offset `ptr`.
3. **Execution:** Bun calls the exported Zig function (e.g., `pub export fn audit_code(ptr: [*]const u8, len: usize) i32`).
4. **Return Codes:**
   - `0`: Clean / Pass
   - `1`: High Risk Issue Found
   - `2`: Critical Security Violation
5. **Instant Purge Lifecycle:** Once complete, the sandbox instance and linear memory allocation are immediately destroyed, returning memory to the host OS.

---

## 4. Bun Micro-Kernel ↔ Go Native Hub (gRPC / mTLS IPC)

### Boundary Architecture
- **Language Pair:** TypeScript (Bun gRPC client) ↔ Go 1.23+ (`personas-hub`)
- **Transport Mechanism:** HTTP/2 gRPC with Protocol Buffers (`proto/hub.proto`) on port `50051`, or REST/SSE on port `8080`.
- **Target Files:** `src_native/hub/main.go`, `src_local/server/dsh_server.ts`

### Security Handshake & Message Size Limits
- **mTLS Certificate Contract:**
  - Standard path: `tls_certs/server.crt`, `tls_certs/server.key`, `tls_certs/ca.crt`.
  - When certs exist: Requires TLS 1.3 with mutual client certificate validation.
  - Development fallback: Runs in unencrypted local loopback mode with warning logging.
- **Buffer Max Limits:**
  - Max Message Receive/Send Size: **128 MB** (configured in Go gRPC options) to accommodate large multi-file AST payload scans.

---

## 5. Bun Micro-Kernel ↔ Idris 2 Formal Verifier (`.idr` Spec Checking)

### Boundary Architecture
- **Language Pair:** TypeScript (FormalVerificationEngine) ↔ Idris 2 Compiler / Interpreter
- **Transport Mechanism:** Dynamic `.idr` specification file generation + CLI compiler invocation / AST inspection.
- **Target Files:** `src_local/engines/healing/formal_verification_engine.ts`, `src_native/formal/patch_verifier.idr`

### Safety Proof Contract
The verifier evaluates proposed code patches against 4 dependent-type mathematical contracts:
1. **Contract A (`FiniteTermination`):** Rejects `while (true)` or `for (;;)` infinite loops without explicit guard bounds.
2. **Contract B (`MemoryBoundsChecked`):** Rejects unsafe constant out-of-bounds indexing (e.g., `[-1]`, `[9999]`).
3. **Contract C (`SqliteInvariantPreserved`):** Rejects unbounded `DELETE FROM` or `UPDATE` queries lacking a `WHERE` clause.
4. **Contract D (`TypeAndNullSafetyPreserved`):** Rejects dangerous type overrides combined with non-null assertions on null values (`as any` with `null!`).
