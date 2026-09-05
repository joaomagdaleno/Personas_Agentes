const std = @import("std");

pub export fn lint_code(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "console.log") != null or std.mem.indexOf(u8, slice, "var ") != null) {
        return 1; // Linter Warning
    }
    return 0; // Clean
}
