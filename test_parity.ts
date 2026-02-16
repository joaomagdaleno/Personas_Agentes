import { ParityAnalyst } from "./src_local/agents/Support/parity_analyst.ts";
import winston from "winston";

// Configure a basic logger for the test
winston.configure({
    transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

async function main() {
    console.log("⚖️ Running Atomic Parity Scan...");
    const analyst = new ParityAnalyst();
    const report = analyst.analyzeAtomicParity();

    console.log(`\nParity Level: ${analyst.getVitalStatus(report)}`);
    console.log(`Overall Parity: ${report.overallParity}%`);
    console.log(`Total Agents: ${report.totalAgents}`);
    console.log(`Identical: ${report.identicalCount}`);
    console.log(`Divergent: ${report.divergentCount}`);
    console.log(`Missing TS: ${report.missingCount}\n`);

    if (report.criticalDeltas.length > 0) {
        console.log("🚨 Critical Deltas:");
        report.criticalDeltas.forEach(d => {
            console.log(` - [${d.dimension}] ${d.context} (PY: ${d.legacy} | TS: ${d.current})`);
        });
    }

    console.log("\n--- Full Report ---");
    console.log(analyst.formatMarkdownReport(report));
}

main().catch(console.error);
