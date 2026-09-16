# Bolt's Journal

## 2026-09-14 - EventBus Synchronous Handler Fast-Path & Handler Map Cleanup
**Learning:** `PsaEventBus.emit()` previously always initialized an empty array fallback `this.listeners.get(event) || []` and looped over handlers using `await handler(data)`. In Bun/JS, using `await` on every element forces microtask queue scheduling even when handlers return `void` or synchronous values. By adding an early return for unhandled events (`if (!handlers || handlers.length === 0) return;`) and inspecting synchronous execution results before awaiting thenables, emission latency drops dramatically. Furthermore, deleting empty arrays from `this.listeners` in `off()` prevents Map size bloat over time.
**Action:** When working on EventBus or hot loop event dispatchers in TypeScript/Bun, prefer checking `res && typeof res.then === "function"` before `await`ing to avoid microtask tick overhead for synchronous event handlers.
