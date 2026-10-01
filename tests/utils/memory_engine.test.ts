import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { MemoryEngine, HistoryAgent } from "../../src_local/engines/healing/resilience_healing_architect_service.ts";
import { join } from "path";
import { rmSync, mkdirSync, writeFileSync } from "fs";

// Pruned 2026-10-01: three cases here (setDepth / syncProjectMemory / prune)
// asserted a constant tautology while exercising near coverage-neutral code, so
// they inflated the suite count without adding signal. They were removed rather
// than propped up with fabricated assertions.
describe("MemoryEngine", () => {
    let engine: MemoryEngine;
    const testRoot = join(process.cwd(), "tmp_memory_test");

    beforeEach(() => {
        mkdirSync(join(testRoot, "src"), { recursive: true });
        writeFileSync(join(testRoot, "src", "index.ts"), "class Main { start() {} }");
        new HistoryAgent(testRoot);
        engine = new MemoryEngine(testRoot);
    });

    afterEach(() => {
        try {
            rmSync(testRoot, { recursive: true, force: true });
        } catch {}
    });

    it("should remember findings", () => {
        engine.rememberFinding({ file: "test.ts", issue: "Memory Leak", severity: "HIGH" });
        const results = engine.searchSimilar("Memory Leak");
        expect(results.length).toBeGreaterThan(0);
    });
});
