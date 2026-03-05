import { ContextEngine } from "./src_local/utils/context_engine.ts";

async function main() {
    const engine = new ContextEngine(".");
    await engine.analyzeProject();

    const highRisk = Object.entries(engine.map)
        .map(([file, info]) => ({
            file,
            cc: info.complexity || 0,
            cog: info.advanced_metrics?.cognitiveComplexity || 0,
            nesting: info.advanced_metrics?.nestingDepth || 0
        }))
        .filter(item => item.cc > 20 || item.cog > 15 || item.nesting > 3)
        .sort((a, b) => b.cc - a.cc);

    console.log(`Found ${highRisk.length} high risk files.`);
    highRisk.slice(0, 50).forEach(item => {
        console.log(`${item.file}: CC=${item.cc}, Cog=${item.cog}, Nest=${item.nesting}`);
    });
}

main();
