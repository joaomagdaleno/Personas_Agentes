/**
 * Global test setup, loaded before every test file (see bunfig.toml `preload`).
 *
 * Three suites create ephemeral scratch directories in the repository root
 * (`.psa_test_scratch_*`, `.psa_test_scratch_exp_*`, `.psa_plugin_test_*`,
 * `.psa_gohub_test_*`, `.psa_loader_test_*`). They are gitignored, but when a
 * test fails before its own teardown runs the directory is left behind, and
 * they had accumulated to 31+ directories across repeated runs.
 *
 * This sweep runs once per `bun test` invocation and removes only directories
 * that match those exact prefixes, so it cannot touch real project files.
 */
import { afterAll } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";

const SCRATCH_PREFIXES = [
    ".psa_test_scratch_",
    ".psa_plugin_test_",
    ".psa_gohub_test_",
    ".psa_loader_test_",
];

afterAll(() => {
    const root = process.cwd();
    let removed = 0;

    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (!SCRATCH_PREFIXES.some((prefix) => entry.name.startsWith(prefix))) continue;
        try {
            fs.rmSync(path.join(root, entry.name), { recursive: true, force: true });
            removed++;
        } catch {
            // Best-effort: a directory can still be held open by a spawned child
            // process on Windows. Leaving it behind is not a test failure.
        }
    }

    if (removed > 0) {
        console.log(`🧹 [test-setup] Removed ${removed} ephemeral scratch director${removed === 1 ? "y" : "ies"}.`);
    }
});
