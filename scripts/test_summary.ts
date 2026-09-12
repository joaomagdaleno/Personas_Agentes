import { spawnSync } from "child_process";
import * as fs from "fs";

function generateTestSummary(): void {
    console.log("🧪 Running PSA test suite for report generation...");
    const startTime = Date.now();

    const proc = spawnSync("bun", ["test"], { encoding: "utf-8" });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const stdout = proc.stdout || "";
    const stderr = proc.stderr || "";
    const fullOutput = stdout + "\n" + stderr;

    let passCount = 0;
    let failCount = 0;
    let fileCount = 0;

    const passMatch = fullOutput.match(/(\d+)\s+pass/);
    if (passMatch && passMatch[1]) passCount = parseInt(passMatch[1], 10);

    const failMatch = fullOutput.match(/(\d+)\s+fail/);
    if (failMatch && failMatch[1]) failCount = parseInt(failMatch[1], 10);

    const fileMatch = fullOutput.match(/across\s+(\d+)\s+files/);
    if (fileMatch && fileMatch[1]) fileCount = parseInt(fileMatch[1], 10);

    const total = passCount + failCount;
    const successRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : "100.0";
    const statusEmoji = failCount === 0 ? "✅" : "❌";

    const reportMarkdown = `
# ${statusEmoji} PSA Sovereign Test Execution Summary

| Metric | Value |
| :--- | :--- |
| **Status** | ${failCount === 0 ? "PASSED" : "FAILED"} |
| **Passed Tests** | \`${passCount}\` |
| **Failed Tests** | \`${failCount}\` |
| **Total Assertions/Tests** | \`${total}\` |
| **Test Files** | \`${fileCount}\` |
| **Success Rate** | \`${successRate}%\` |
| **Execution Duration** | \`${duration}s\` |

### 🛠️ Tested Architecture Layers
- **Core Orchestrator & gRPC Hub**: TS & Bun Micro-Kernel
- **Polyglot Engines**: Zig WASM Micro-Agents, Rust SIMD Analyzer, Go AST Scanner
- **SLM Engine**: Warm-Purge offline GGUF local model with 60s linger window
- **Formal Gate**: Idris 2 dynamic mathematical safety verifier
- **Persistence**: SQLite trajectory vault & compaction
- **Super Personas**: 8 Sovereign AI Architect Personas

> *Generated automatically by Spec 🧪 Quality Agent*
`;

    console.log(reportMarkdown);

    const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (stepSummaryPath) {
        try {
            fs.appendFileSync(stepSummaryPath, reportMarkdown + "\n");
            console.log(`✨ Published test summary to GitHub Step Summary (${stepSummaryPath})`);
        } catch (err) {
            console.error("⚠️ Failed to write to GITHUB_STEP_SUMMARY:", err);
        }
    }

    if (proc.status !== 0) {
        process.exit(proc.status || 1);
    }
}

generateTestSummary();
