import { ContextEngine } from "../src_local/utils/context_engine.ts";

async function main() {
    const engine = new ContextEngine(".");
    await engine.analyzeProject();

    const nestingIssues = Object.entries(engine.map)
        .map(([file, info]) => ({
            file,
            nesting: info.advanced_metrics?.nestingDepth || 0
        }))
        .filter(item => item.nesting > 3)
        .sort((a, b) => b.nesting - a.nesting);

    console.log(`Found ${nestingIssues.length} files with Nesting > 3.`);
    nestingIssues.forEach(item => {
        console.log(`${item.file}: Nest=${item.nesting}`);
    });
}

main();
