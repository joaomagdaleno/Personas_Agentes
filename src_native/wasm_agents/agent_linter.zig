//! WASM Micro-Agent: Code Linter
//!
//! Ephemeral WASI WebAssembly micro-agent compiled from Zig.
//! Scans source buffers for legacy language constructs and stray console log statements.

const std = @import("std");

/// Lints source code buffer for legacy `var` declarations or stray debugging logs.
///
/// Returns 1 if linter warnings are detected, otherwise 0.
pub export fn lint_code(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "console.log") != null or std.mem.indexOf(u8, slice, "var ") != null) {
        return 1; // Linter Warning
    }
    return 0; // Clean
}
