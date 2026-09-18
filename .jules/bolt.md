# Bolt's Journal

## 2026-09-18 - Pre-compiled Combined Regex and Indexed Loop in Governance VetoEngine
**Learning:** `VetoEngine.isTechnicalMath()` previously instantiated a new `RegExp` object inside a `.some()` callback for every technical math term on every invocation (`techTerms.some(t => new RegExp("\\b" + t + "\\b").test(lower))`). Combining all 28 technical terms into a single static pre-compiled regex (`TECH_TERMS_REGEX = /\b(alpha|progress|offset|...)\b/`) and using a simple indexed `for` loop over static `MONEY_TERMS` eliminated repeated regex construction and closure allocation overhead, resulting in a ~54% latency reduction (1319ms -> 605ms for 400k string evaluations).
**Action:** Always pre-compile static word list regexes at class or module scope instead of dynamically instantiating `new RegExp()` inside loops in hot-path string filtering methods.

## 2026-09-14 - EventBus Synchronous Handler Fast-Path & Handler Map Cleanup
**Learning:** `PsaEventBus.emit()` previously always initialized an empty array fallback `this.listeners.get(event) || []` and looped over handlers using `await handler(data)`. In Bun/JS, using `await` on every element forces microtask queue scheduling even when handlers return `void` or synchronous values. By adding an early return for unhandled events (`if (!handlers || handlers.length === 0) return;`) and inspecting synchronous execution results before awaiting thenables, emission latency drops dramatically. Furthermore, deleting empty arrays from `this.listeners` in `off()` prevents Map size bloat over time.
**Action:** When working on EventBus or hot loop event dispatchers in TypeScript/Bun, prefer checking `res && typeof res.then === "function"` before `await`ing to avoid microtask tick overhead for synchronous event handlers.
