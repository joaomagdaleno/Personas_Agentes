import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { ZvecGrepPlugin } from "../src_local/psa/plugins/core/zvec_grep_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/zvec_grep_plugin.ts
 * Layer: Micro-Kernel Core Plugins / Hybrid Vector & Semantic RAG Search Engine
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("ZvecGrepPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const plugin = new ZvecGrepPlugin();
        plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register zvec_grep.search tool in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("zvec_grep.search");
    });

    it("should execute zvec_grep.search and return formatted RAG search hits with content and filePath", async () => {
        // Act
        const result = await ctx.tools.executeTool("zvec_grep.search", {
            query: "StrategicCognitiveArchitectService",
            limit: 2
        });

        // Assert
        expect(result.status).toBe("success");
        const hits = result.result as Array<{ filePath: string; content: string; score?: number }>;

        expect(Array.isArray(hits)).toBe(true);
        expect(hits.length).toBeGreaterThan(0);
        expect(hits[0].filePath).toBeDefined();
        expect(hits[0].content).toBeDefined();
    });
});
