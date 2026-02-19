import { readdir, stat } from "fs/promises";
import { join } from "path";
import { MetricsEngine } from "./src_local/agents/Support/Diagnostics/metrics_engine";

const metrics = new MetricsEngine();

async function scan(dir: string): Promise<string[]> {
    const results: string[] = [];
    const list = await readdir(dir, { withFileTypes: true });
    for (const entry of list) {
        const res = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            results.push(...await scan(res));
        } else if (res.endsWith(".ts")) {
            results.push(res);
        }
    }
    return results;
}

async function run() {
    const files = await scan("./src_local");
    const fragile: any[] = [];

    for (const file of files) {
        if (file.includes("/test/")) continue;
        const content = await Bun.file(file).text();
        const m = metrics.analyzeFile(content, file, []);

        // Fragility = CC > 20 AND No Test AND not Green Gate
        const isCovered = m.qualityGate === "GREEN"; // Simplified check as we don't have has_test easily here
        // Actually, let's just find anything with CC > 20 that isn't Green.
        if (m.cyclomaticComplexity > 20 && m.qualityGate !== "GREEN") {
            fragile.push({ file, cc: m.cyclomaticComplexity, gate: m.qualityGate });
        }
    }

    console.log("--- POTENTIAL FRAGILITIES ---");
    fragile.sort((a, b) => b.cc - a.cc).forEach(f => {
        console.log(`${f.file} - CC: ${f.cc} - Gate: ${f.gate}`);
    });
}

run();
