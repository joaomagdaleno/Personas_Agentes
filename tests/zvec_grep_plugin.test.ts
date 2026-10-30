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
        // O @zvec/zvec-grep é um pacote nativo que requer bundling (esbuild/bun build).
        // Em execução direta (bun test) ou em sandbox sem o binário nativo, a inicialização
        // falha silenciosamente e a busca retorna []. Este caso verifica a resposta válida
        // e marca o teste como esperado para o ambiente.
        const result = await ctx.tools.executeTool("zvec_grep.search", {
            query: "StrategicCognitiveArchitectService",
            limit: 2
        });

        expect(result.status).toBeDefined();
        const hits = result.result as Array<{ filePath: string; content: string; score?: number }>;

        expect(Array.isArray(hits)).toBe(true);
        expect(hits[0].filePath).toBeDefined();
        expect(hits[0].content).toBeDefined();
    });
});
