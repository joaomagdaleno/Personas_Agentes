import { ContextEngine } from "./src_local/utils/context_engine.ts";
import { QualityAnalyst } from "./src_local/agents/Support/Diagnostics/quality_analyst.ts";

async function main() {
    const engine = new ContextEngine(".");
    const ctx = await engine.analyzeProject();

    const qa = new QualityAnalyst();
    const matrix = qa.calculateConfidenceMatrix(ctx.map);
    const findings = qa.generateMetricFindings(matrix);

    const counts: Record<string, number> = {};
    findings.forEach(f => {
        counts[f.file] = (counts[f.file] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    console.log(`Top files with metric findings:`);
    sorted.slice(0, 50).forEach(([file, count]) => {
        const info = engine.map[file];
        console.log(`${file}: ${count} findings (CC=${info.complexity}, Cog=${info.advanced_metrics?.cognitiveComplexity}, Nest=${info.advanced_metrics?.nestingDepth})`);
    });
}

main();
