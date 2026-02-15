# Restored Components Analysis: The "Zombie" GUI

## 1. Status Overview

We have successfully restored the Python Interface files, but they are currently **non-functional** ("Zombie State").

| Component | Status | Critical Missing Dependency |
| :--- | :--- | :--- |
| **`main_gui.py`** (Tkinter) | ❌ Broken | `src_local.core.orchestrator` (Moved to Bun) |
| **`gui_native.py`** (CustomTkinter) | ❌ Broken | `src_local.core.orchestrator` (Moved to Bun) |
| **`cognitive_engine.py`** | ⚠️ Unknown | Needs verification (Likely intact) |
| **Views (`dashboard`, `chat`)** | ✅ Intact | Require a working Orchestrator instance to render data. |

## 2. Functional Analysis

### A. `main_gui.py` (Legacy Entry Point)

- **Tech:** Standard `tkinter`.
- **Role:** Simple dashboard with "Run Diagnostic" and "Auto-Heal" buttons.
- **Verdict:** **Deprecate**. It is visually outdated compared to `gui_native.py`.

### B. `gui_native.py` (Modern Entry Point)

- **Tech:** `customtkinter` (Modern, Dark Mode support).
- **Features:**
  - **Health Gauge:** Visual representation of system health.
  - **Findings View:** detailed list of issues.
  - **Chat View:** Interface for `cognitive_engine.py` (Local LLM).
  - **Sidebar:** Navigation and async task triggers.
- **Verdict:** **KEEP & ADAPT**. This is a valuable "High-Command" dashboard.

### C. `cognitive_engine.py` (The Layout)

- **Role:** Provides local AI reasoning (using `llama-cpp-python` or similar).
- **Verdict:** **KEEP**. This allows "free" local inference without querying external APIs, perfect for the "Hybrid Sidecar".

### D. `scripts/` Analysis

- **`shadow_tray.py`**: The System Tray application.
  - **Status:** ❌ Broken (Imports `Orchestrator`).
  - **Features:** CPU/RAM monitoring, "Focus Mode" toggles, and background diagnostic triggers.
  - **Verdict:** **RESTORE**. Users love system tray apps. It needs the Bridge.
- **`fast_diagnostic.py`**: Git Hook.
  - **Status:** ✅ FIXED. I already patched this to call `bun run` directly.
- **`launch_dashboard.py`**: Launcher for the Native GUI.
  - **Status:** ❌ Broken (Imports `Orchestrator`).
  - **Verdict:** **RESTORE**. Use the Bridge here too.
- **`persona_manager.py`**: Validates existence of Python Persona files.
  - **Status:** ⚠️ Partial. It checks for Python files that might have been moved/deprecated.
  - **Verdict:** **REVIEW**. Low priority.

### E. Root Directory Scripts

- **`run-diagnostic.ts`**: **THE BRAIN**. The new Bun-based core.
  - **Status:** ✅ ACTIVE.
- **`extract_personas.ts`**: Migration tool (Python -> JSON).
  - **Status:** ✅ Utility. Useful if new Python personas are added.
- **`activate-phase.ts`**: Context CLI tool.
  - **Status:** ✅ Utility. Helps user copy agent context to clipboard.
- **`update-git.ts`**: Submodule sync tool.
  - **Status:** ✅ Utility. Keeps `.agent` synced.

## 3. The Problem

The GUIs were designed to import the `Orchestrator` class directly from Python:

```python
from src_local.core.orchestrator import Orchestrator  # <--- THIS FILE IS GONE!
```

The logic is now in `run-diagnostic.ts` (Bun).

## 4. The Solution: "The Lazarus Bridge"

We do not need to rewrite the GUI in web technologies (React/Electron) yet. We can simply create a **Python Bridge**:

1. **Create `src_local/core/bridge_orchestrator.py`**:
    - Implements the same methods as the old Orchestrator (`generate_full_diagnostic`, etc.).
    - **Internally:** Calls `subprocess.run(["bun", "run", "run-diagnostic.ts"])`.
    - **Data:** Reads results from `system_vault.db` and passing them back to the GUI.

2. **Update `gui_native.py` and `shadow_tray.py`**:
    - Change import logic to use `BridgeOrchestrator`.

## 5. Recommendation

**Authorize the creation of the Bridge.** This instantly revives the Modern GUI (`gui_native.py`) and completes the Hybrid Architecture.
