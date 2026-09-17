# Bolt's Journal

## 2026-09-17 - Bun.CryptoHasher Fast-Path with Stream Chunking for SHA-256
**Learning:** For SHA-256 model weight hash verification (`.gguf` files), buffering whole multi-gigabyte files into memory causes OOM/crashes. Using `globalThis.Bun.CryptoHasher("sha256")` wrapped in stream chunking (`fs.createReadStream` with a 1MB buffer) preserves zero-OOM memory streaming while leveraging Bun's fast native C++/BoringSSL hasher.
**Action:** When computing digests for large binary files in Bun, combine `fs.createReadStream` (1MB chunk size) with `Bun.CryptoHasher` instead of `crypto.createHash` for safe, streamable C++ native speedups.

## 2026-09-14 - EventBus Synchronous Handler Fast-Path & Handler Map Cleanup
**Learning:** `PsaEventBus.emit()` previously always initialized an empty array fallback `this.listeners.get(event) || []` and looped over handlers using `await handler(data)`. In Bun/JS, using `await` on every element forces microtask queue scheduling even when handlers return `void` or synchronous values. By adding an early return for unhandled events (`if (!handlers || handlers.length === 0) return;`) and inspecting synchronous execution results before awaiting thenables, emission latency drops dramatically. Furthermore, deleting empty arrays from `this.listeners` in `off()` prevents Map size bloat over time.
**Action:** When working on EventBus or hot loop event dispatchers in TypeScript/Bun, prefer checking `res && typeof res.then === "function"` before `await`ing to avoid microtask tick overhead for synchronous event handlers.
