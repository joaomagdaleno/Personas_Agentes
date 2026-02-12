# Native Modern UI (Low RAM / No Browser)

A native Python GUI that provides a premium 2026 experience without the resource overhead of Chromium or Webview.

## Architecture: "Native Sovereignty"

- **UI Engine**: **CustomTkinter** (Modern, lightweight, OS-native performance).
- **Design System**: Dark mode with accent gradients (Cyan/Magenta), custom icons, and smooth transitions.
- **Resource Goal**: < 50MB RAM (Interface only) and zero browser dependency.

## Proposed Changes

### [GUI - Lightweight Desktop App]

#### [NEW] [gui_native.py](file:///c:/Users/joaovitormagdaleno/Documents/GitHub/Personas_Agentes/src_local/interface/gui_native.py)

- **Main View**: Dashboard with a custom Health Gauge component.
- **Persona Panel**: Sidebar with active icons and status indicators.
- **Battle Plan List**: Scrollable list of actionable engineering tasks.
- **Log Console**: Integrated terminal view for real-time audit feedback.

### [Orchestration Bridge]

#### [MODIFY] [orchestrator.py](file:///c:/Users/joaovitormagdaleno/Documents/GitHub/Personas_Agentes/src_local/core/orchestrator.py)

- Implement event-driven updates (using `threading` or `queue`) so the GUI refreshes without blocking analysis.

### [Packaging]

#### [MODIFY] [scripts/build_exe.py](file:///c:/Users/joaovitormagdaleno/Documents/GitHub/Personas_Agentes/scripts/build_exe.py)

- Configure PyInstaller to bundle CustomTkinter assets and external personas.

## Verification Plan

### Manual Verification

- Launch the GUI and verify RAM usage in Task Manager.
- Ensure the "Health Gauge" updates in real-time during project analysis.
- Verify that closing the app terminates all background audit threads.
