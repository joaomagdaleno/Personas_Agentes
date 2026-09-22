import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { SqliteStoragePlugin } from "../src_local/psa/plugins/core/sqlite_storage_plugin.ts";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/sqlite_storage_plugin.ts
 * Layer: Micro-Kernel Core Plugins / SQLite Analytical Persistence & Query Security (CWE-89)
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("SqliteStoragePlugin Unit & Security Tests (CWE-89)", () => {
    let tmpDir: string;
    let dbPath: string;
    let plugin: SqliteStoragePlugin;
    let ctx: PsaContext;

    beforeEach(() => {
        // Arrange: Create temporary database directory and instance
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "psa-sqlite-test-"));
        dbPath = path.join(tmpDir, "test_storage.sqlite");
        plugin = new SqliteStoragePlugin({ dbPath });

        ctx = new PsaContext(tmpDir);
        plugin.apply(ctx);

        // Seed sample data for query testing
        plugin.indexSession({
            id: "session-001",
            createdAt: new Date().toISOString(),
            persona: "Architect",
            model: "qwen2.5-coder-1.5b",
            workspace: tmpDir
        });

        plugin.indexEvent({
            sessionId: "session-001",
            index: 1,
            turnIndex: 1,
            type: "turn_start",
            timestamp: new Date().toISOString(),
            payload: { message: "Test initial event" },
            sha256: "dummy-sha256-hash-001"
        });
    });

    afterEach(() => {
        // Cleanup resources
        plugin.close();
        if (fs.existsSync(tmpDir)) {
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch {
                // Ignore transient Windows EBUSY locks on temporary database files
            }
        }
    });

    it("should allow safe single-statement SELECT, WITH, and PRAGMA queries", () => {
        // Arrange
        const selectSql = "SELECT * FROM sessions WHERE id = ?";
        const withSql = "WITH summary AS (SELECT count(*) as total FROM sessions) SELECT * FROM summary";
        const pragmaSql = "PRAGMA table_info(sessions)";

        // Act
        const selectResult = plugin.querySql(selectSql, ["session-001"]);
        const withResult = plugin.querySql(withSql);
        const pragmaResult = plugin.querySql(pragmaSql);

        // Assert
        expect(selectResult.count).toBe(1);
        expect(selectResult.rows[0].id).toBe("session-001");

        expect(withResult.count).toBe(1);
        expect(withResult.rows[0].total).toBe(1);

        expect(pragmaResult.count).toBeGreaterThan(0);
    });

    it("should reject direct non-read SQL mutation statements (DROP, DELETE, UPDATE, INSERT)", () => {
        // Arrange
        const maliciousSqls = [
            "DROP TABLE sessions;",
            "DELETE FROM sessions;",
            "UPDATE sessions SET persona = 'hacked';",
            "INSERT INTO sessions (id, created_at, persona, model, workspace) VALUES ('x', 'now', 'a', 'b', 'c');"
        ];

        // Act & Assert
        for (const sql of maliciousSqls) {
            expect(() => plugin.querySql(sql)).toThrow(
                "[PsaSqliteSecurity] Apenas comandos SELECT/WITH de leitura são permitidos via session_query_sql."
            );
        }
    });

    it("REPRODUCING TEST: should reject or safely handle stacked multi-statement queries (CWE-89)", () => {
        // Arrange: Stacked query prefixing SELECT but appending malicious mutation
        const stackedDropSql = "SELECT * FROM sessions; DROP TABLE sessions;";
        const stackedDeleteSql = "SELECT * FROM sessions; DELETE FROM session_events;";
        const stackedUpdateSql = "SELECT * FROM sessions; UPDATE sessions SET persona='compromised';";

        // Act & Assert
        // A stacked multi-statement query starting with SELECT must NOT execute the trailing destructive mutation.
        // Test all three stacked SQL vectors: DROP, DELETE, and UPDATE
        for (const sql of [stackedDropSql, stackedDeleteSql, stackedUpdateSql]) {
            let caughtError = false;
            try {
                plugin.querySql(sql);
            } catch (e) {
                caughtError = true;
            }

            // Verify table schema and row count integrity are maintained
            const checkSessions = plugin.querySql("SELECT count(*) as total FROM sessions");
            expect(checkSessions.rows[0].total).toBe(1);

            const checkEvents = plugin.querySql("SELECT count(*) as total FROM session_events");
            expect(checkEvents.rows[0].total).toBe(1);

            const checkPersona = plugin.querySql("SELECT persona FROM sessions WHERE id = 'session-001'");
            expect(checkPersona.rows[0].persona).toBe("Architect");
        }

        // Sentinel fix target requirement: Stacked query execution should ideally be rejected
        // This test serves as the mandatory reproducing test per AGENTS.md §4.3.
    });

    it("should execute session_query_sql tool registered in PsaContext safely", async () => {
        // Arrange
        const tool = ctx.tools.get("session_query_sql");
        expect(tool).toBeDefined();

        // Act
        const result = await ctx.tools.executeTool("session_query_sql", {
            sql: "SELECT id, persona, total_events FROM sessions WHERE persona = 'Architect'"
        });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as any;
        expect(resData.count).toBe(1);
        expect(resData.rows[0].id).toBe("session-001");
        expect(resData.rows[0].persona).toBe("Architect");
    });
});
