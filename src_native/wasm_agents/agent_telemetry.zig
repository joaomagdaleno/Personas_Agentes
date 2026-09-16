//! WASM Micro-Agent: Telemetry & Metrics Sampler
//!
//! Ephemeral WASI WebAssembly micro-agent compiled from Zig.
//! Samples high-precision millisecond timestamps and runtime metrics for sandboxed micro-agents.

const std = @import("std");

/// Returns the current millisecond timestamp from high-precision WASI clock.
pub export fn sample_metrics() i64 {
    return @as(i64, @intCast(std.time.milliTimestamp()));
}
