# Operational Troubleshooting Guide 🛠️

This guide provides diagnostic procedures, common error scenarios, and resolution steps for operating and debugging Personas_Agentes (PSA).

---

## 1. SLM Warm-Purge & Memory Issues

### Issue: Local SLM Engine Fails to Purge VRAM/RAM or Crashes on Load
**Symptoms:**
- High RAM usage (> 2 GB) persists after 60 seconds of model inactivity.
- `LocalSLMEngine` logs `Local SLM crash` or `OOM (Out Of Memory)` errors during prompt execution.

**Root Causes & Diagnosis:**
1. **Model Weight Corruption:** The downloaded `.gguf` file hash does not match expected SHA-256 digests.
2. **Missing Native Accelerators:** Fallback to unoptimized CPU execution causing memory pressure.

**Resolution Steps:**
1. **Verify Hash Integrity:**
   Run the model downloader tool in verification mode:
   ```bash
   bun run download-model --model 1.5b
   ```
   If hash mismatch is detected, `download_model.ts` will automatically purge the corrupted `.gguf` file and re-download verified weights.

2. **Force Manual Purge in Code/Tests:**
   Trigger forced memory purge via `WarmPurgeOfflineEngine`:
   ```typescript
   import { WarmPurgeOfflineEngine } from "./src_local/utils/ai/warm_purge_offline_engine";
   WarmPurgeOfflineEngine.getInstance().forcePurge();
   ```

3. **Check Cascade Failover:**
   When local SLM fails, `LocalSLMEngine` automatically routes inference requests to Hugging Face Serverless API, and finally to local deterministic static responses if offline. Ensure network access is enabled if relying on Hugging Face fallback.

---

## 2. Native Hub gRPC / mTLS Handshake Failures

### Issue: Micro-Kernel Cannot Connect to Go Native Hub
**Symptoms:**
- Log warning: `Aguardando Hub gRPC (2/5)...`
- Connection error: `UNAVAILABLE: Connection refused` or `TLS Handshake Failed`.

**Root Causes & Diagnosis:**
1. **Missing TLS Certificates:** `tls_certs/` folder lacks valid `server.crt`, `server.key`, or `ca.crt`.
2. **Go Hub Binary Not Compiled:** `bin/hub` executable missing.

**Resolution Steps:**
1. **Rebuild Native Binaries:**
   Run the binary compilation script from project root:
   ```bash
   bun run ensure-binaries
   ```

2. **Verify mTLS Certificates:**
   Check if certificates exist in `tls_certs/`. In development mode, if certificates are absent, the Hub will log a warning and run in local unencrypted loopback mode. To regenerate development TLS keys:
   ```bash
   cd src_native/hub
   go run scripts/gen_certs.go
   ```

3. **Test Hub Service Directly:**
   ```bash
   cd src_native/hub
   go test ./...
   ```

---

## 3. WASM Micro-Agent Sandbox & Resource Budget Limits

### Issue: WASM Micro-Agent Execution Rejected or Times Out
**Symptoms:**
- Log message: `WASM execution rejected: Sovereign Resource Budget limit reached`.
- `WasmMicroAgentRuntime` throws execution error for `agent_database.wasm` or `agent_security.wasm`.

**Root Causes & Diagnosis:**
1. **Concurrency Limit Exceeded:** Too many simultaneous WASI sandboxes active (> 8 active instances).
2. **Missing Compiled `.wasm` Bytecode:** `bin/wasm/` folder missing `.wasm` files.

**Resolution Steps:**
1. **Recompile WASM Micro-Agents:**
   Run the WASM build script:
   ```bash
   bun run scripts/build_wasm.ts
   ```

2. **Trigger WASI Sandbox Purge:**
   Execute instant purge on `WasmMicroAgentRuntime`:
   ```typescript
   import { WasmMicroAgentRuntime } from "./src_local/utils/wasm/wasm_micro_agent_runtime";
   WasmMicroAgentRuntime.getInstance().purgeAll();
   ```

---

## 4. Idris 2 Formal Safety Proof Rejections

### Issue: Auto-Healing Patch Rejected by Formal Verifier
**Symptoms:**
- Log message: `❌ [FormalVerifier] Patch REJEITADO por violação do Contract...`

**Root Causes & Diagnosis:**
The verifier enforces 4 inviolable mathematical safety contracts:
- **Contract A:** Infinite loops (`while (true)` / `for (;;)`).
- **Contract B:** Constant out-of-bounds array access (e.g. `[-1]`, `[9999]`).
- **Contract C:** Unbounded SQLite `DELETE` or `UPDATE` lacking a `WHERE` clause.
- **Contract D:** Type overrides on null values (`as any` with `null!`).

**Resolution Steps:**
1. Inspect the generated patch for missing `WHERE` clauses in SQL queries or unbounded loop constructs.
2. Ensure explicit guard conditions are present in the patch code before re-submitting to `FormalVerificationEngine`.

---

## 5. Test Suite Reports 204/207 Instead of 207/207 (Sandboxed Environment)

### Issue: Three Tests Fail Locally With `EPERM`, But Pass in CI

**Symptoms:**
- `bun test` reports `204 pass, 3 fail` instead of the documented 207/207 baseline.
- The three failures are always the same:
  - `dsh_fs_shell_plugins.test.ts` → *deve executar comando nativo via ShellPlugin e capturar stdout/exitCode*
  - `psa_expanded_suite.test.ts` → *TerminalPtyPlugin > deve instanciar processo interativo, ler buffer e encerrar sessão*
  - `zvec_grep_plugin.test.ts` → *should execute zvec_grep.search and return formatted RAG search hits with content and filePath*
- The error is `EPERM: operation not permitted, uv_spawn '<binary>'`.

**Root Causes & Diagnosis:**
This is an **environment limitation, not a code defect**. Some sandboxed harnesses (e.g. the DSH file/process sandbox) deny child processes that use **piped stdio**. All three tests legitimately require piping, so they cannot succeed under confinement:

| Component | Spawn site | Blocked binary |
| :--- | :--- | :--- |
| `ShellPlugin` (`shell.exec`) | `src_local/psa/plugins/core/shell_plugin.ts` | `powershell.exe` |
| `TerminalPtyPlugin` | `src_local/psa/plugins/core/terminal_pty_plugin.ts` | `cmd.exe` (uses `stdin/stdout/stderr: "pipe"`) |
| `@zvec/zvec-grep` | `node_modules/@zvec/zvec-grep` → `execFile` | `rg.exe` (bundled `@vscode/ripgrep`) |

The `zvec` case is the least obvious: the logged message is a wrapper. Inspecting `error.cause` reveals the true `EPERM` originating from ripgrep.

To confirm the boundary, compare spawn behaviour:

```typescript
spawn(cmd, args, { stdio: "inherit" }) // works under sandbox
spawn(cmd, args, { stdio: "ignore"  }) // works under sandbox
spawn(cmd, args)                       // defaults to "pipe" -> EPERM
```

**Resolution Steps:**
1. **Do NOT change the code to make these pass under a sandbox.** Switching to `stdio: "inherit"` would silence the failure while destroying the actual feature — `shell.exec` exists precisely to capture stdout/exitCode, and the PTY requires all three pipes.
2. **Run the suite in a non-sandboxed environment for a true baseline.** The CI pipeline (`.github/workflows/ci.yml`, `windows-latest`) runs `bun run test:coverage` without any sandbox and reliably reports 207/207.
3. **Trust the 207/207 baseline from CI.** A local `204/207` in a confined shell is expected and is not a regression.
4. If you must run elevated locally, granting the process full access restores all three tests (`207 pass, 0 fail`, exit code 0).
