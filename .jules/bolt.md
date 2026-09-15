# Bolt's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-15 - EventBus Synchronous Fast-Path & Map Memory Pruning
**Learning:** In TypeScript/Bun event buses, always using `await handler(data)` inside a `for..of` loop forces JS runtime microtask queue scheduling and Promise allocation even when event handlers execute completely synchronously. By executing handlers directly and only awaiting thenable promises (`res !== undefined && typeof res?.then === 'function'`), emit latency dropped from 411.53ms to 87.67ms for 500k ops (78.7% reduction). Additionally, deleting empty listener arrays in `off()` prevents Map key accumulation over long session lifecycles.
**Action:** Apply synchronous fast-path checking for high-frequency internal event buses and hook dispatchers across the micro-kernel stack, and ensure Map listener cleanups purge empty keys.
