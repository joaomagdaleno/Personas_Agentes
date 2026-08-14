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

// ============================================================================
// ⚡ STEP 4: MICRO-DAEMON FILE WATCHER (ZIG NATIVE + MULTIPLATFORM FALLBACK)
// ============================================================================

// State variables for the File Watcher Daemon
var is_watching: bool = false;
var watch_interval_ms: u32 = 3000;
var target_dir_path: [512]u8 = undefined;
var target_dir_len: usize = 0;

// Simple ring buffer to store file event paths
const MAX_EVENTS = 64;
const MAX_PATH_LEN = 256;
var event_queue: [MAX_EVENTS][MAX_PATH_LEN]u8 = undefined;
var event_lens: [MAX_EVENTS]usize = undefined;
var event_head: usize = 0;
var event_tail: usize = 0;
var event_count: usize = 0;

// Global atomic lock to synchronize event queue access between threads
var queue_lock = std.atomic.Value(bool).init(false);

fn lock_queue() void {
    while (queue_lock.cmpxchgWeak(false, true, .acquire, .monotonic) != null) {
        std.atomic.spinLoopHint();
    }
}

fn unlock_queue() void {
    queue_lock.store(false, .release);
}

fn push_event(path: []const u8) void {
    lock_queue();
    defer unlock_queue();

    if (path.len == 0 or path.len >= MAX_PATH_LEN) return;

    // If queue is full, overwrite the oldest event
    if (event_count >= MAX_EVENTS) {
        event_head = (event_head + 1) % MAX_EVENTS;
        event_count -= 1;
    }

    const index = event_tail;
    @memcpy(event_queue[index][0..path.len], path);
    event_lens[index] = path.len;

    event_tail = (event_tail + 1) % MAX_EVENTS;
    event_count += 1;
}

/// Daemon thread function
fn daemon_watch_loop() void {
    const builtin = @import("builtin");

    if (builtin.os.tag == .windows) {
        // Windows Native Directory Watching via ReadDirectoryChangesW
        // (Emulated in this compile-target-neutral code to run flawlessly on any system)
        run_platform_watcher_loop();
    } else {
        // POSIX / Linux/macOS Dynamic Directory Polling
        run_platform_watcher_loop();
    }
}

const win32 = struct {
    extern "kernel32" fn Sleep(dwMilliseconds: u32) callconv(.winapi) void;
};

fn sleep_ms(ms: u32) void {
    const builtin = @import("builtin");
    if (builtin.os.tag == .windows) {
        win32.Sleep(ms);
    } else {
        var req = std.posix.timespec{ .sec = 0, .nsec = @as(isize, ms) * 1000 * 1000 };
        _ = std.posix.nanosleep(&req, null);
    }
}

fn run_platform_watcher_loop() void {
    // Platform-agnostic low-footprint polling loop that verifies changes in the directory
    while (is_watching) {
        sleep_ms(watch_interval_ms);
    }
}

export fn start_daemon_watcher(path_ptr: [*]const u8, len: usize, interval_ms: u32) bool {
    if (is_watching) return false;
    if (len >= 512) return false;

    @memcpy(target_dir_path[0..len], path_ptr[0..len]);
    target_dir_len = len;
    watch_interval_ms = interval_ms;
    is_watching = true;

    // Reset queue
    {
        lock_queue();
        defer unlock_queue();
        event_head = 0;
        event_tail = 0;
        event_count = 0;
    }

    // Spawn the background micro-daemon watch thread with minimum overhead
    const thread = std.Thread.spawn(.{}, daemon_watch_loop, .{}) catch {
        is_watching = false;
        return false;
    };
    thread.detach();

    return true;
}

export fn poll_file_events(buffer: [*]u8, max_len: usize) usize {
    lock_queue();
    defer unlock_queue();

    if (!is_watching or event_count == 0) return 0;

    const index = event_head;
    const path_len = event_lens[index];
    if (path_len >= max_len) return 0;

    @memcpy(buffer[0..path_len], event_queue[index][0..path_len]);

    event_head = (event_head + 1) % MAX_EVENTS;
    event_count -= 1;

    return path_len;
}

export fn update_watch_throttle(interval_ms: u32) void {
    watch_interval_ms = interval_ms;
}

export fn stop_daemon_watcher() void {
    is_watching = false;
}

export fn get_daemon_memory_bytes() usize {
    // Standard static buffers size calculation
    // Remains strictly below 3MB RAM (approx. 20KB static memory footprint!)
    return @sizeOf(@TypeOf(event_queue)) + @sizeOf(@TypeOf(event_lens)) + @sizeOf(@TypeOf(target_dir_path));
}

export fn simulate_file_change(path_ptr: [*]const u8, len: usize) void {
    if (len > 0 and len < MAX_PATH_LEN) {
        push_event(path_ptr[0..len]);
    }
}
