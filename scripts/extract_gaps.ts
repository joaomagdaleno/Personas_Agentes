import fs from "node:fs";
import { GapScanner } from "../src_local/agents/Support/Diagnostics/strategies/GapScanner.ts";

const REPORT_PATH = "docs/auto_healing_VERIFIED.md";
const OUTPUT_FILE = "gap_analysis_detailed.txt";

function main() {
    const gaps = GapScanner.extractFromFile(REPORT_PATH);
    const output = GapScanner.formatAnalysis(gaps);

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Written to ${OUTPUT_FILE}`);
}

main();
