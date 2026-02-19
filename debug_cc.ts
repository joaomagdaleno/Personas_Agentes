import { ComplexityAnalyst } from "./src_local/agents/Support/Diagnostics/strategies/ComplexityAnalyst.ts";

async function test() {
    const files = [
        "src_local/utils/depth_intelligence.ts",
        "src_local/agents/Support/Diagnostics/metrics_engine.ts",
        "src_local/agents/Support/Diagnostics/quality_analyst.ts"
    ];

    for (const f of files) {
        const content = await Bun.file(f).text();
        const cc = ComplexityAnalyst.calculateCyclomaticComplexity(content);
        console.log(`CC of ${f}: ${cc}`);
    }
}

test();
