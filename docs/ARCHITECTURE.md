# Personas_Agentes (PSA) — Polyglot Sovereign Architecture

## Overview

Personas_Agentes (PSA) is a local-first, privacy-sovereign multi-agent AI execution platform. It spans a 6-language polyglot architecture engineered for high speed, zero cloud dependency, mathematical safety proofs, and strict resource containment.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           C# / WinUI 3 Desktop Client                             │
│                     Native Fluent UI • Direct SSE & REST IPC                      │
└─────────────────────────┬─────────────────────────────────────────────────────────┘
                          │ HTTP SSE / REST (:3080)
                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        TypeScript / Bun Micro-Kernel Orchestrator                  │
│               EventBus • PsaLLMService • WarmPurge • Plugin Engine                │
└─────────┬───────────────────┬─────────────────────┬───────────────────┬───────────┘
          │ gRPC / mTLS       │ C-ABI / bun:ffi     │ WASI Sandbox      │ Process / IPC
          ▼                   ▼                     ▼                   ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│     Go Hub       ││ Rust SIMD Engine ││ WASM Micro-Agents││ Idris 2 Verifier │
│ TreeSitter / mTLS││ AST Complexity   ││ Zig Sandboxes    ││ Formal Proofs    │
└──────────────────┘└──────────────────┘└──────────────────┘└──────────────────┘
```

---

## Polyglot Stack & Responsibilities

| Subsystem | Primary Language | Directory | Key Responsibility |
|---|---|---|---|
| **Desktop Client** | C# (.NET 8 WinUI 3) | `src_native/winui/` | Native Fluent UI, zero WebView2 overhead, SSE stream rendering, Markdown cards |
| **Micro-Kernel** | TypeScript (Bun) | `src_local/` | EventBus dispatch, agent coordination, WarmPurge offline engine, HTTP REST/SSE server |
| **Native Hub** | Go 1.23+ | `src_native/hub/` | gRPC/mTLS RPC server, Tree-Sitter AST scanner, file system watcher, SQLite vault |
| **SIMD Analyzer** | Rust | `src_native/analyzer/` | Fast cyclomatic complexity, FNV1a hashing, C-ABI exports, graph dependency analysis |
| **WASM Micro-Agents**| Zig | `src_native/wasm_agents/` | Ephemeral sandboxed micro-agents (audit, security, git, telemetry, database, linter) |
| **Formal Safety Gate**| Idris 2 | `src_native/formal/` | Dependent-type formal proof checking (loop termination, array bounds, SQL invariants) |

---

## Critical Architectural Flows

### 1. SLM Warm-Purge Engine (Memory Management)

To guarantee local performance on consumer hardware without lingering VRAM/RAM consumption, the SLM Warm-Purge engine manages local GGUF models with a strict 60-second activity window before complete memory deallocation.

```mermaid
sequenceDiagram
    autonumber
    participant Client as WinUI 3 / Bun
    participant Engine as LocalSLMEngine
    participant WP as WarmPurgeOfflineEngine
    participant RAM as System RAM / OS

    Client->>Engine: executePrompt(model, prompt)
    Engine->>WP: loadAndInfer(model)
    alt Model not in RAM
        WP->>RAM: Allocate GGUF model weights
    else Model already loaded
        WP->>WP: Reset 60s Linger Timer
    end
    WP-->>Engine: Stream Tokens
    Engine-->>Client: Stream Tokens
    Note over WP,RAM: Linger Timer runs (60 seconds idle)
    alt New prompt within 60s
        Client->>Engine: executePrompt()
        Engine->>WP: Reset 60s Linger Timer
    else 60s timeout expires
        WP->>RAM: Forced Purge (Deallocate GGUF weights)
        Note over WP,RAM: Memory returned 100% to OS (0 MB lingering)
    end
```

### 2. Cascade Failover Routing

PSA prioritizes offline local execution, seamlessly falling back to Hugging Face Serverless API, and finally to local deterministic static response generators if network or model errors occur.

```mermaid
flowchart TD
    A[Inference Request] --> B{Local GGUF Model Available?}
    B -- Yes --> C[Execute via WarmPurge Local SLM]
    C --> D{Success?}
    D -- Yes --> E[Return Stream / Tokens]
    D -- No (Crash / OOM) --> F
    B -- No --> F[Failover to Hugging Face Serverless API]
    F --> G{API Available & 200 OK?}
    G -- Yes --> E
    G -- No (HTTP 5xx / Network Down) --> H[Execute Local Deterministic Static Fallback]
    H --> E
```

### 3. Native Go Hub gRPC / mTLS Security Handshake

Inter-process communication between the Bun Orchestrator and the Go Native Hub uses gRPC protected by mutual TLS (mTLS) with TLS 1.3 when certificates are present.

```mermaid
sequenceDiagram
    autonumber
    participant Bun as Bun Micro-Kernel
    participant Hub as Go Native Hub
    participant Cert as TLS Cert Store (tls_certs/)

    Bun->>Hub: gRPC Connect Request (:50051)
    alt Certificates present in tls_certs/
        Hub->>Cert: Load server.crt, server.key & ca.crt
        Hub->>Bun: Server TLS Certificate + Client Cert Challenge
        Bun->>Hub: Client Certificate Validation
        Note over Bun,Hub: Handshake complete: TLS 1.3 mTLS Encrypted
    else Certificates missing
        Note over Bun,Hub: Warning logged: Dev Mode (Insecure Channel)
    end
    Bun->>Hub: gRPC Service Invocation (AnalyzeFile / WatchHealth)
    Hub-->>Bun: Streaming Response / Protobuf Payload
```

### 4. WASM Micro-Agent Sandbox Lifecycle & Instant Purge

Zig micro-agents run inside ephemeral WASI WebAssembly sandboxes managed by `WasmMicroAgentRuntime`. Each invocation gets isolated linear memory and is immediately purged upon task completion.

```mermaid
sequenceDiagram
    autonumber
    participant Orchestrator as PsaContext
    participant Runtime as WasmMicroAgentRuntime
    participant WASI as WASI Sandbox (agent_*.wasm)

    Orchestrator->>Runtime: executeAgent(agentName, inputBuffer)
    Runtime->>Runtime: Check Sovereign Resource Budget
    Runtime->>WASI: Instantiate WebAssembly.Instance (Linear Memory)
    Runtime->>WASI: Write input bytes into exports.memory
    Runtime->>WASI: Call exported audit/probe function
    WASI-->>Runtime: Return integer risk code / status
    Runtime->>WASI: Instant Purge (Destroy WASI instance & memory)
    Note over Runtime,WASI: Deallocated ~600KB - 1024KB memory back to runtime
    Runtime-->>Orchestrator: Return Structured Result
```

### 5. Idris 2 Formal Safety Verification Gate

Auto-healing patches generated by PSA agents must pass dependent-type formal safety verification before code application.

```mermaid
flowchart TD
    Patch[Proposed Auto-Heal Patch] --> Verifier[FormalVerificationEngine]
    Verifier --> Spec[Generate Idris 2 Contract Spec .idr]
    Spec --> CheckA{Contract A: Infinite Loop?}
    CheckA -- Yes (while true) --> Reject[REJECT PATCH: Infinite Loop Risk]
    CheckA -- No --> CheckB{Contract B: Out-of-bounds Array Access?}
    CheckB -- Yes ([-1] / [9999]) --> Reject
    CheckB -- No --> CheckC{Contract C: Unbounded SQL DELETE/UPDATE?}
    CheckC -- Yes (No WHERE clause) --> Reject
    CheckC -- No --> CheckD{Contract D: Type Overrides on Null?}
    CheckD -- Yes (as any + null!) --> Reject
    CheckD -- No --> Approve[APPROVE PATCH: All 4 Idris Contracts Passed]
```

---

## Reference Guide: 8 Super Personas

| Persona Plugin | Identifier | Focus & Tools | Primary Stack |
|---|---|---|---|
| **Strategic Cognitive** | `strategic_cognitive` | Strategic reasoning, phase decomposition (`strategic.decompose`) | Polyglot |
| **Audit Code** | `audit_code` | Code quality scorecards, complexity analysis (`code_auditor.scan`) | Polyglot / Rust |
| **Security Cloud** | `security_cloud` | SBOM generation, vulnerability scanning (`security.scan_sbom`) | Security / Cloud |
| **Architecture Types** | `architecture_types` | Type system invariants, structural depth (`architecture.inspect`) | TypeScript / C# / Rust |
| **Resilience Healing**| `resilience_healing` | Auto-repair patch generation (`auto_healer.repair`) | Polyglot / Idris 2 |
| **SysPerf** | `sys_perf` | System hardware profiling, RAM/CPU limits (`sysperf.profile`) | OS / Native |
| **Sync DevOps** | `sync_devops` | Git status reporting, conflict resolution (`devops.status`) | Git / CI |
| **UI/UX Architect** | `ui_ux_architect` | Trajectory digest formatting, native WinUI card specs | C# WinUI 3 |

---

## Reference Guide: 6 WASM Micro-Agents

| Agent | Source File | WASM Binary | Contract Function | Focus |
|---|---|---|---|---|
| **Audit** | `agent_audit.zig` | `agent_audit.wasm` | `audit_code`, `security_probe` | Silent catch detection, shannon entropy, dangerous eval/exec |
| **Security** | `agent_security.zig` | `agent_security.wasm` | `scan_vulnerabilities` | Hardcoded secrets, API tokens, SQL injection patterns |
| **Git** | `agent_git.zig` | `agent_git.wasm` | `analyze_commit` | Conventional commit validation, git conflict marker detection |
| **Telemetry** | `agent_telemetry.zig` | `agent_telemetry.wasm` | `collect_diagnostics` | System health diagnostics, memory pressure scoring |
| **Database** | `agent_database.zig` | `agent_database.wasm` | `inspect_query` | Unbounded query detection (missing WHERE/LIMIT), SQL safety |
| **Linter** | `agent_linter.zig` | `agent_linter.wasm` | `lint_source` | Polyglot code smell detection, long function detection |
