import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { Idris2FormalVerificationPlugin } from "../src_local/psa/plugins/core/idris2_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/core/idris2_plugin.ts
 * Layer: Micro-Kernel Core Plugins / Idris 2 Formal Proof Gate
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("Idris2FormalVerificationPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const plugin = new Idris2FormalVerificationPlugin();
        plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register idris2_verifier.verify tool in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("idris2_verifier.verify");
    });

    it("should approve valid patch code that satisfies all 4 mathematical formal contracts", async () => {
        // Arrange
        const safePatch = `
            function updateUser(id: string, name: string) {
                if (!id) return;
                return db.query("UPDATE users SET name = ? WHERE id = ?", [name, id]);
            }
        `;

        // Act
        const result = await ctx.tools.executeTool("idris2_verifier.verify", { patchCode: safePatch });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { approved: boolean; contracts: any[] };
        expect(resData.approved).toBe(true);
        expect(resData.contracts.length).toBe(4);
    });

    it("should reject unsafe patch code violating Contract A (infinite loop) with error status", async () => {
        // Arrange
        const unsafePatch = `
            function processQueue() {
                while (true) {
                    // Unbounded infinite loop violation
                }
            }
        `;

        // Act
        const result = await ctx.tools.executeTool("idris2_verifier.verify", { patchCode: unsafePatch });

        // Assert
        expect(result.status).toBe("error");
        expect(String(result.result)).toContain("Contratos formais violados");
        expect(String(result.result)).toContain("Finite Termination Proof");
    });

    it("should reject unsafe patch code violating Contract C (unbounded SQL DELETE) with error status", async () => {
        // Arrange
        const dangerousSqlPatch = `
            function clearAll() {
                db.execute("DELETE FROM users");
            }
        `;

        // Act
        const result = await ctx.tools.executeTool("idris2_verifier.verify", { patchCode: dangerousSqlPatch });

        // Assert
        expect(result.status).toBe("error");
        expect(String(result.result)).toContain("Contratos formais violados");
        expect(String(result.result)).toContain("SQLite Invariants Preservation");
    });
});
