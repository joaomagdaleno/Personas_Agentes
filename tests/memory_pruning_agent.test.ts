import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { MemoryPruningAgent } from "../src_local/engines/maintenance/memory_pruning_agent.ts";
import { Database } from "bun:sqlite";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";

describe("MemoryPruningAgent Unit Tests", () => {
    let tmpDir: string;
    let dbPath: string;

    beforeEach(() => {
        tmpDir = path.join(os.tmpdir(), `psa-pruner-test-${Math.random().toString(36).substring(7)}`);
        fs.mkdirSync(tmpDir, { recursive: true });
        dbPath = path.join(tmpDir, "system_vault.db");

        const db = new Database(dbPath);
        db.query(`
            CREATE TABLE IF NOT EXISTS health_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                score REAL
            )
        `).run();

        // Insert old record (> 90 days ago) and recent record
        db.query("INSERT INTO health_history (timestamp, score) VALUES (datetime('now', '-100 days'), 85.0)").run();
        db.query("INSERT INTO health_history (timestamp, score) VALUES (datetime('now', '-10 days'), 95.0)").run();
        db.close();
    });

    afterEach(() => {
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    it("should initialize agent cleanly", async () => {
        // Arrange - Component: MemoryPruningAgent | Pattern: AAA
        const pruner = new MemoryPruningAgent(tmpDir);

        // Act & Assert
        expect(pruner.id).toBe("maintenance.pruner");
        expect(pruner.name).toBe("MemoryPruningAgent");
        await expect(pruner.initialize()).resolves.toBeUndefined();
    });

    it("should prune logs older than specified threshold", async () => {
        // Arrange - Component: MemoryPruningAgent | Pattern: AAA
        const pruner = new MemoryPruningAgent(tmpDir);

        // Act
        await pruner.execute({ projectRoot: tmpDir, days: 30 } as any);

        // Assert
        const db = new Database(dbPath);
        const records = db.query("SELECT * FROM health_history").all();
        db.close();

        expect(records.length).toBe(1);
        expect((records[0] as any).score).toBe(95.0);
    });
});
