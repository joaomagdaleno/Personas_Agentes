const std = @import("std");

pub export fn sample_metrics() i64 {
    return @as(i64, @intCast(std.time.milliTimestamp()));
}
