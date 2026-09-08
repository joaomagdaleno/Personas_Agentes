import { describe, it, expect, beforeEach } from "bun:test";
import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { RustSimdPlugin } from "../src_local/psa/plugins/native/rust_simd_plugin.ts";

/**
 * Component Under Test: src_local/psa/plugins/native/rust_simd_plugin.ts
 * Layer: Native Plugins / Rust SIMD AST Auditor & Fast 64-bit Hasher
 * Pattern: Arrange-Act-Assert (AAA)
 */
describe("RustSimdPlugin Unit Tests", () => {
    let ctx: PsaContext;

    beforeEach(() => {
        ctx = new PsaContext(process.cwd());
        const plugin = new RustSimdPlugin();
        plugin.apply(ctx);
        ctx.plugins.register(plugin);
    });

    it("should register native.rust_complexity, native.rust_hash, and native.rust_status tools in PsaContext", () => {
        // Arrange
        const registeredTools = ctx.tools.list();
        const toolNames = registeredTools.map(t => t.name);

        // Assert
        expect(toolNames).toContain("native.rust_complexity");
        expect(toolNames).toContain("native.rust_hash");
        expect(toolNames).toContain("native.rust_status");
    });

    it("should query native Rust engine status via native.rust_status", async () => {
        // Act
        const result = await ctx.tools.executeTool("native.rust_status", {});

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { available: boolean; engine: string; version: string };
        expect(typeof resData.available).toBe("boolean");
        expect(resData.engine).toBeDefined();
        expect(resData.version).toBe("2.0.0");
    });

    it("should calculate cyclomatic complexity of source code string via native.rust_complexity", async () => {
        // Arrange
        const codeSample = `
            function calculateTotal(items: number[]) {
                let total = 0;
                for (let i = 0; i < items.length; i++) {
                    if (items[i] > 0) {
                        total += items[i];
                    } else {
                        console.warn("Negative item ignored");
                    }
                }
                return total;
            }
        `;

        // Act
        const result = await ctx.tools.executeTool("native.rust_complexity", { content: codeSample });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { success: boolean; complexity: number; engine: string };
        expect(resData.success).toBe(true);
        expect(resData.complexity).toBeGreaterThan(1);
        expect(resData.engine).toBeDefined();
    });

    it("should generate 64-bit hash string for input text via native.rust_hash", async () => {
        // Arrange
        const textSample = "Personas_Agentes_SIMD_Hash_Validation";

        // Act
        const result = await ctx.tools.executeTool("native.rust_hash", { content: textSample });

        // Assert
        expect(result.status).toBe("success");
        const resData = result.result as { success: boolean; hash: string; engine: string };
        expect(resData.success).toBe(true);
        expect(typeof resData.hash).toBe("string");
        expect(resData.hash.length).toBeGreaterThan(0);
        expect(resData.engine).toBeDefined();
    });
});
