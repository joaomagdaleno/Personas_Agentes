import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { CompactionPlugin, type CompactionSummary } from "../src_local/psa/plugins/core/compaction_plugin.ts";
import { SqliteStoragePlugin } from "../src_local/psa/plugins/core/sqlite_storage_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/compaction_plugin.ts
 * Layer: Micro-Kernel Core Plugins / Context Compaction & SQLite Vacuuming
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("CompactionPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const sqlitePlugin = new SqliteStoragePlugin(":memory:");
        sqlitePlugin.apply(ctx);
        ctx.plugins.register(sqlitePlugin);

        const compactionPlugin = new CompactionPlugin();
        compactionPlugin.apply(ctx);
        ctx.plugins.register(compactionPlugin);
    });

    it("should register compaction.vacuum_db and compaction.compact tools in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("compaction.vacuum_db");
        expect(toolNames).toContain("compaction.compact");
    });

    it("should execute compaction.vacuum_db and trigger SQLite VACUUM successfully", async () => {
        // Act
        const result = await ctx.tools.executeTool("compaction.vacuum_db", {});

        // Assert
        expect(result.status).toBe("success");
        expect((result.result as any).success).toBe(true);
        expect((result.result as any).message).toContain("VACUUM");
    });

    it("should execute compaction.compact over a session trajectory and summarize turns, files, contracts, and decisions", async () => {
        // Arrange
        const sessionId = `test-session-compact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Append trajectory events simulating a turn start, file write, formal verification, and reasoning decision
        ctx.sessions.append(sessionId, 1, "turn_start", {});
        ctx.sessions.append(sessionId, 1, "tool_call", { args: { filePath: "src/core/hub.ts" } });
        ctx.sessions.append(sessionId, 1, "verification", { text: "Idris 2 Contract A: Finite Termination Proof Verified" });
        ctx.sessions.append(sessionId, 1, "reasoning", { content: "Decisão de arquitetura: adotar mTLS para gRPC Hub" });

        ctx.sessions.append(sessionId, 2, "turn_start", {});
        ctx.sessions.append(sessionId, 2, "tool_call", { args: { filePath: "src/core/event_bus.ts" } });

        // Act
        const result = await ctx.tools.executeTool("compaction.compact", { sessionId });

        // Assert
        expect(result.status).toBe("success");
        const summary = result.result as CompactionSummary;

        expect(summary.sessionId).toBe(sessionId);
        expect(summary.totalTurnsCompact).toBe(2);
        expect(summary.touchedFiles).toContain("src/core/hub.ts");
        expect(summary.touchedFiles).toContain("src/core/event_bus.ts");
        expect(summary.verifiedContracts).toContain("Idris 2 Contract A: Finite Termination Proof Verified");
        expect(summary.coreDecisions.some(d => d.includes("mTLS"))).toBe(true);
        expect(summary.tokensSavedEstimate).toBeGreaterThan(0);
        expect(summary.distilledContext).toContain("Resumo Compactado de Sessão PSA");
    });
});
