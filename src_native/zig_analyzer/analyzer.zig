const std = @import("std");

/// Calculates the Shannon Entropy of a string.
/// Higher entropy (closer to 8.0 for 8-bit bytes) indicates high randomness,
/// which is typically found in cryptographic keys, secrets, or obfuscated code.
export fn calculate_entropy(str: [*]const u8, len: usize) f64 {
    if (len == 0) return 0.0;

    var counts = [_]usize{0} ** 256;
    var i: usize = 0;
    while (i < len) : (i += 1) {
        counts[str[i]] += 1;
    }

    var entropy: f64 = 0.0;
    const len_f = @as(f64, @floatFromInt(len));

    for (counts) |count| {
        if (count > 0) {
            const p = @as(f64, @floatFromInt(count)) / len_f;
            entropy -= p * (std.math.log2(p));
        }
    }

    return entropy;
}

/// A blazingly fast scanner for unsafe or operating-blindness patterns.
/// Returns true if any prohibited or high-risk pattern is detected.
export fn check_unsafe_patterns(str: [*]const u8, len: usize) bool {
    if (len == 0) return false;
    const slice = str[0..len];

    // Check for generic high-risk patterns
    if (std.mem.indexOf(u8, slice, "eval(") != null) return true;
    if (std.mem.indexOf(u8, slice, "exec(") != null) return true;
    if (std.mem.indexOf(u8, slice, "system(") != null) return true;
    if (std.mem.indexOf(u8, slice, "shell=True") != null) return true;
    if (std.mem.indexOf(u8, slice, "catch unreachable") != null) return true;
    if (std.mem.indexOf(u8, slice, "except: pass") != null) return true;

    return false;
}
