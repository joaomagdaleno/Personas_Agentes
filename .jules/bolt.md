# Bolt's Journal

## 2026-09-20 - VetoEngine RegExp Pre-compilation & Static Set Lookups
**Learning:** `VetoEngine.isTechnicalMath` dynamically instantiated 28 `new RegExp()` objects on every call inside `Array.prototype.some`. In governance hot paths evaluating code lines across multi-file scans, dynamic RegExp instantiation creates significant GC pressure and CPU overhead. Replacing dynamic RegExp construction with a single pre-compiled word-boundary regular expression (`TECH_TERMS_REGEX`), coupled with `Set` lookup (`IGNORED_SET`) in `shouldVeto` and fast `for` loops for short-circuiting, reduced execution latency from 5.97s to 2.73s per 1M operations (a ~54.3% latency reduction).
**Action:** Always pre-compile static regular expressions and hoist set/keyword lookup structures outside class methods when methods are invoked in high-frequency loop environments.

## 2026-09-14 - EventBus Synchronous Handler Fast-Path & Handler Map Cleanup
**Learning:** `PsaEventBus.emit()` previously always initialized an empty array fallback `this.listeners.get(event) || []` and looped over handlers using `await handler(data)`. In Bun/JS, using `await` on every element forces microtask queue scheduling even when handlers return `void` or synchronous values. By adding an early return for unhandled events (`if (!handlers || handlers.length === 0) return;`) and inspecting synchronous execution results before awaiting thenables, emission latency drops dramatically. Furthermore, deleting empty arrays from `this.listeners` in `off()` prevents Map size bloat over time.
**Action:** When working on EventBus or hot loop event dispatchers in TypeScript/Bun, prefer checking `res && typeof res.then === "function"` before `await`ing to avoid microtask tick overhead for synchronous event handlers.
