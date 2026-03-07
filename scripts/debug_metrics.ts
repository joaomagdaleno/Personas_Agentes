import { ContextEngine } from "./src_local/utils/context_engine.ts";
import { Path } from "./src_local/core/path_utils.ts";

async function main() {
    const engine = new ContextEngine(".");
    await engine.analyzeProject();

    const file = "scripts/extract_personas.ts";
    const info = engine.map[file];
    if (info) {
        console.log(`File: ${file}`);
        console.log(`Complexity: ${info.complexity}`);
        console.log(`Go Metrics: ${JSON.stringify(info.atomic_go_metrics)}`);
        console.log(`Advanced Metrics CC: ${info.advanced_metrics?.cyclomaticComplexity}`);
    } else {
        console.log(`File ${file} not found in map. Keys: ${Object.keys(engine.map).slice(0, 10)}`);
    }
}

main();
