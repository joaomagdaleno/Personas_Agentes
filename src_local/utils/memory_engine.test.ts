
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { MemoryEngine } from './memory_engine.ts';
import { join } from 'node:path';
import { rmSync, existsSync, mkdirSync } from 'node:fs';

describe('MemoryEngine', () => {
    const testRoot = join(process.cwd(), 'tmp_memory_test');
    let memoryEngine: MemoryEngine;

    beforeEach(() => {
        if (!existsSync(testRoot)) {
            mkdirSync(testRoot, { recursive: true });
        }
        memoryEngine = new MemoryEngine(testRoot);
        // Initialize schema (assuming there's a schema, otherwise db.run will fail)
        // Let's check if MemoryEngine creates tables.
        // Looking at MemoryEngine.ts, it doesn't show table creation in constructor.
        // It might be created elsewhere or by the Hub.
        // Let's create it manually for the test if it fails.
        try {
            memoryEngine['db'].run("CREATE TABLE IF NOT EXISTS ai_insights (id INTEGER PRIMARY KEY, mode TEXT, insight TEXT, impact_level TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
        } catch (e) { }
    });

    afterEach(() => {
        // Close DB before deleting
        memoryEngine['db'].close();
        if (existsSync(testRoot)) {
            rmSync(testRoot, { recursive: true, force: true });
        }
    });

    it('should set thinking depth', () => {
        memoryEngine.setDepth(10);
        expect(memoryEngine['thinkingDepth']).toBe(10);
    });

    it('should remember findings', () => {
        const finding = { file: 'test.ts', issue: 'Major bug', severity: 'CRITICAL' };
        memoryEngine.rememberFinding(finding);

        const results = memoryEngine.searchSimilar('Major bug');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].insight).toContain('test.ts');
    });

    it('should sync file memory and extract anchors', () => {
        const contextMap = {
            'class.ts': { content: 'class MyTest { function doWork() {} }', component_type: 'CORE' }
        };
        memoryEngine.syncProjectMemory(contextMap);

        const results = memoryEngine.searchSimilar('Anchors for class.ts');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].insight).toContain('MyTest');
        expect(results[0].insight).toContain('doWork');
    });

    it('should prune old entries', () => {
        // Insert an old entry
        memoryEngine['db'].run("INSERT INTO ai_insights (mode, insight, impact_level, timestamp) VALUES (?, ?, ?, datetime('now', '-31 days'))", ["MEMORY", "old", "LOW"]);

        memoryEngine.prune();

        const results = memoryEngine.searchSimilar('old');
        expect(results.length).toBe(0);
    });
});
