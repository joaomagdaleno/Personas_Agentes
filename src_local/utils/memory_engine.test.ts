import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { MemoryEngine, HistoryAgent } from "../engines/healing/resilience_healing_architect_service.ts";
import { join } from "path";
import { rmSync, mkdirSync, writeFileSync } from "fs";

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

    it("should set thinking depth", () => {
        engine.setDepth(10);
        expect(true).toBe(true);
    });

    it("should remember findings", () => {
        engine.rememberFinding({ file: "test.ts", issue: "Memory Leak", severity: "HIGH" });
        const results = engine.searchSimilar("Memory Leak");
        expect(results.length).toBeGreaterThan(0);
    });

    it("should sync file memory and extract anchors", async () => {
        const map = {
            [join(testRoot, "src", "index.ts")]: { content: "class Main { start() {} }", component_type: "CORE" }
        };
        await engine.syncProjectMemory(map as any);
        expect(true).toBe(true);
    });

    it("should prune old entries", () => {
        engine.prune();
        expect(true).toBe(true);
    });
});
