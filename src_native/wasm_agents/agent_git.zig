//! WASM Micro-Agent: Git Commit & Conflict Validator
//!
//! Ephemeral WASI WebAssembly micro-agent compiled from Zig.
//! Inspects file contents and commit messages for unresolved Git merge conflict markers (`<<<<<<<` / `>>>>>>>`).

const std = @import("std");

/// Validates Git commit or source file buffer for unresolved merge conflict markers.
///
/// Returns 2 if unresolved merge conflict markers are detected, otherwise 0.
pub export fn validate_git_commit(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "<<<<<<<") != null and std.mem.indexOf(u8, slice, ">>>>>>>") != null) {
        return 2; // Conflict markers present
    }
    return 0; // Clean
}
