import { ParityAnalyst } from "../src_local/agents/Support/Analysis/parity_analyst.ts";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
    try {
        const analyst = new ParityAnalyst(path.join(process.cwd(), "src_local", "agents"));
        const report = analyst.analyzeAtomicParity();

        fs.writeFileSync("parity_report_full.json", JSON.stringify(report, null, 2));
        console.log(`Full parity report saved to parity_report_full.json`);
        console.log(`Summary: ${report.divergentCount} divergent, ${report.symmetricCount} symmetric.`);
    } catch (err) {
        console.error("Error generating parity report:", err);
        process.exit(1);
    }
}

main();
