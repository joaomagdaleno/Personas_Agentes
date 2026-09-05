const std = @import("std");

pub export fn security_audit(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "eval(") != null or std.mem.indexOf(u8, slice, "exec(") != null) {
        return 2; // Critical: Unsafe dynamic execution
    }
    if (std.mem.indexOf(u8, slice, "password") != null or std.mem.indexOf(u8, slice, "secret_key") != null) {
        return 1; // Warning: Hardcoded secret candidate
    }
    return 0; // Clean
}
