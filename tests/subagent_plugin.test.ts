import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { SubagentPlugin, type SubagentResult } from "../src_local/psa/plugins/core/subagent_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/subagent_plugin.ts
 * Layer: Micro-Kernel Core Plugins / Subagent Orchestration & Hierarchical Session Forking
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("SubagentPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const plugin = new SubagentPlugin();
        plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register subagent.spawn tool in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("subagent.spawn");
    });

    it("should spawn subagent, emit subagent lifecycle events, and return completed SubagentResult", async () => {
        // Arrange
        let spawnedEventReceived = false;
        let completedEventReceived = false;

        ctx.events.on("subagent/spawned", () => {
            spawnedEventReceived = true;
        });

        ctx.events.on("subagent/completed", () => {
            completedEventReceived = true;
        });

        const parentSessionId = `parent_${Date.now()}`;
        ctx.sessions.create({
            sessionId: parentSessionId,
            persona: "strategic_cognitive_architect",
            model: "deepseek-v4-flash"
        });

        // Act
        const result = await ctx.tools.executeTool("subagent.spawn", {
            persona: "audit_code_guardian",
            prompt: "Analise a complexidade ciclomática de src/core/hub.ts",
            parentSessionId
        });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as SubagentResult;

        expect(resData.status).toBe("completed");
        expect(resData.parentSessionId).toBe(parentSessionId);
        expect(resData.persona).toBe("audit_code_guardian");
        expect(resData.childSessionId).toBeDefined();
        expect(resData.synthesizedOutput).toBeDefined();
        expect(resData.synthesizedOutput.length).toBeGreaterThan(0);
        expect(spawnedEventReceived).toBe(true);
        expect(completedEventReceived).toBe(true);
    });
});
