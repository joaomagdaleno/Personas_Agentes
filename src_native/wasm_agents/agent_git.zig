const std = @import("std");

pub export fn validate_git_commit(ptr: [*]const u8, len: usize) i32 {
    const slice = ptr[0..len];
    if (std.mem.indexOf(u8, slice, "<<<<<<<") != null and std.mem.indexOf(u8, slice, ">>>>>>>") != null) {
        return 2; // Conflict markers present
    }
    return 0; // Clean
}
