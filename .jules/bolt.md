# Bolt's Journal

Critical learnings only.
Format: ## YYYY-MM-DD - [Title] / **Learning:** ... / **Action:** ...

## 2026-09-16 - Synchronous EventBus Emission Latency Optimization & Map Cleanup
**Learning:** In Bun/TypeScript high-throughput event buses (`PsaEventBus`), unconditionally using `await handler(data)` inside event loops forces synchronous handlers to wrap return values into microtask Promises, introducing significant event loop tick delays (~21.79 ms per 100k executions). By invoking handlers directly and conditionally awaiting only when a thenable is returned, latency is cut by ~73% (down to ~5.89 ms). Furthermore, deleting empty handler arrays in `off()` prevents Map memory key bloat over long daemon runtimes.
**Action:** Always check `res && typeof res.then === 'function'` when dispatching mixed sync/async callbacks in core event loop pathways.
