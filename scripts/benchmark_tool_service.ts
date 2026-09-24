import { PsaContext } from "../src_local/psa/kernel/psa_context.ts";
import { PsaToolService } from "../src_local/psa/tools/psa_tool_service.ts";

async function main() {
    console.log("⚡ Bolt Benchmark - PsaToolService.executeTool");
    const ctx = new PsaContext();
    const toolService = ctx.tools;

    toolService.register({
        name: "test.fast_tool",
        description: "Benchmark test tool",
        schema: {},
        execute: async (args) => {
            return { sum: args.a + args.b };
        }
    });

    // Warmup
    for (let i = 0; i < 100; i++) {
        await toolService.executeTool("test.fast_tool", { a: 1, b: 2 });
    }

    const iterations = 50000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await toolService.executeTool("test.fast_tool", { a: i, b: i + 1 });
    }
    const elapsed = performance.now() - start;

    console.log(`\n📊 Benchmark Result: ${iterations} tool calls took ${elapsed.toFixed(2)} ms (${(elapsed / iterations * 1000).toFixed(4)} µs/call)`);
}

main().catch(console.error);
