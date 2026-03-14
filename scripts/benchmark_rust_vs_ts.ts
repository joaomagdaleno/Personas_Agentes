import { PatternFinder } from "../src_local/agents/strategies/PatternFinder.ts";
import * as fs from "node:fs";
import * as path from "node:path";

async function runBenchmark() {
    console.log("🚀 Starting Rust vs TS Benchmark...");

    // 1. Prepare dummy context if project is too small, but here the project is large enough.
    // Let's load some files from src_local.
    const projectRoot = process.cwd();
    const context: Record<string, any> = {};

    function walk(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file !== "node_modules" && file !== ".git" && file !== "target") {
                    walk(fullPath);
                }
            } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
                context[path.relative(projectRoot, fullPath)] = {
                    content: fs.readFileSync(fullPath, "utf-8"),
                    component_type: "CODE"
                };
            }
        }
    }

    walk(path.join(projectRoot, "src_local"));
    console.log(`📂 Loaded ${Object.keys(context).length} files.`);

    const dummyAgent: any = {
        name: "BenchmarkAgent",
        role: "Tester",
        emoji: "🧪",
        stack: "TypeScript",
        projectRoot: projectRoot
    };

    const baseRules = [
        { regex: /TODO/g, issue: "Found TODO", severity: "medium" },
        { regex: /FIXME/g, issue: "Found FIXME", severity: "high" },
        { regex: /console\.log/g, issue: "Found console.log", severity: "low" },
        { regex: /eval\(/g, issue: "Found eval", severity: "critical" },
        { regex: /async/g, issue: "Found async keyword", severity: "low" },
        { regex: /import/g, issue: "Found import", severity: "low" },
    ];

    // Artificial rule multiplication to simulate 100 personas
    const rules: any[] = [];
    for (let i = 0; i < 100; i++) {
        rules.push(...baseRules.map(r => ({ ...r, issue: `${r.issue} ${i}` })));
    }

    const extensions = [".ts", ".tsx"];

    // --- TS BENCHMARK ---
    console.log("\n⌛ Running TypeScript Audit...");
    const tsStart = performance.now();
    let tsResults: any[] = [];
    // Simulate 10 runs to get better average
    for (let i = 0; i < 10; i++) {
        tsResults = [];
        for (const [file, data] of Object.entries(context) as [string, any][]) {
            // @ts-ignore
            const matches = PatternFinder.scanFile(file, data.content, rules, dummyAgent);
            tsResults.push(...matches);
        }
    }
    const tsEnd = performance.now();
    const tsTime = (tsEnd - tsStart) / 10;
    console.log(`✅ TS Audit finished in ${tsTime.toFixed(2)}ms (avg of 10 runs). Findings: ${tsResults.length}`);

    // --- RUST BENCHMARK ---
    console.log("\n⌛ Running Rust Audit...");
    const rustStart = performance.now();
    let rustResults: any[] = [];
    const bulkContext = { ...context };
    const personaRules = [{
        agent: dummyAgent.name,
        role: dummyAgent.role,
        emoji: dummyAgent.emoji,
        stack: dummyAgent.stack,
        extensions,
        rules: rules.map(r => ({
            regex: (PatternFinder as any).normalizeToRustRegex(r.regex),
            issue: r.issue,
            severity: r.severity
        }))
    }];

    for (let i = 0; i < 10; i++) {
        rustResults = await PatternFinder.findBulk(bulkContext, personaRules, projectRoot);
    }
    const rustEnd = performance.now();
    const rustTime = (rustEnd - rustStart) / 10;
    console.log(`✅ Rust Audit finished in ${rustTime.toFixed(2)}ms (avg of 10 runs). Findings: ${rustResults.length}`);

    // --- RESULTS ---
    const speedup = tsTime / rustTime;
    console.log("\n--- Benchmark Summary ---");
    console.log(`TypeScript: ${tsTime.toFixed(2)}ms`);
    console.log(`Rust:       ${rustTime.toFixed(2)}ms`);
    console.log(`Speedup:    ${speedup.toFixed(1)}x`);

    // --- PARITY CHECK ---
    console.log("\n⚖️ Checking Parity...");
    // Rust groups by rule per file, TS scanFile (the way I called it) also groups?
    // Wait, my updated TS scanFile also groups by rule per file.

    if (tsResults.length !== rustResults.length) {
        console.warn(`⚠️ Parity mismatch! TS Findings: ${tsResults.length}, Rust Findings: ${rustResults.length}`);

        // Detailed diff
        const tsMap = new Set(tsResults.map(r => `${r.file}:${r.issue}`));
        const rustMap = new Set(rustResults.map(r => `${r.file}:${r.issue}`));

        for (const r of tsResults) {
            if (!rustMap.has(`${r.file}:${r.issue}`)) {
                console.log(`  - TS has but Rust lacks: ${r.file} -> ${r.issue}`);
            }
        }
        for (const r of rustResults) {
            if (!tsMap.has(`${r.file}:${r.issue}`)) {
                console.log(`  - Rust has but TS lacks: ${r.file} -> ${r.issue}`);
            }
        }
    } else {
        console.log("✅ Parity confirmed (same number of findings).");

        // Check if counts match
        let countMismatch = 0;
        for (const r of rustResults) {
            const tsMatch = tsResults.find(tr => tr.file === r.file && tr.issue === r.issue);
            if (tsMatch && tsMatch.match_count !== r.match_count) {
                console.warn(`  - Count mismatch in ${r.file} for ${r.issue}: TS=${tsMatch.match_count}, Rust=${r.match_count}`);
                countMismatch++;
            }
        }
        if (countMismatch === 0) {
            console.log("✅ Match counts also confirmed.");
        }
    }
}

runBenchmark().catch(console.error);
