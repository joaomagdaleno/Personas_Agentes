const std = @import("std");

pub export fn audit_sql(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "WHERE") == null and (std.mem.indexOf(u8, slice, "DELETE") != null or std.mem.indexOf(u8, slice, "UPDATE") != null)) {
        return 2; // Critical: Unbounded query without WHERE
    }
    return 0; // Safe
}
