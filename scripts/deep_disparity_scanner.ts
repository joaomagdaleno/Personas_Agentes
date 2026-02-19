import { join } from "path";
import winston from "winston";
import { DisparityScanner } from "../src_local/agents/Support/Diagnostics/strategies/DisparityScanner.ts";

const LEGACY_ROOT = join(process.cwd(), "legacy_restore"),
    RESTORE_ROOT = join(process.cwd(), "src_local"),
    REPORT_FILE = "deep_disparity_report.md";

const logger = winston.createLogger({ level: "info", format: winston.format.simple(), transports: [new winston.transports.Console()] });

const FILE_MAPPINGS: Record<string, string> = {
    "structural_analyst.py": "agents/Support/structural_analyst.ts",
    "integrity_guardian.py": "agents/Support/integrity_guardian.ts"
};
const IGNORE_LIST = ["__init__.py", "setup.py", "requirements.txt"];

async function main() {
    const scanner = new DisparityScanner();
    const legacy = await scanner.scanDir(LEGACY_ROOT, LEGACY_ROOT, true, IGNORE_LIST);
    const restore = await scanner.scanDir(RESTORE_ROOT, RESTORE_ROOT, false, IGNORE_LIST);

    const result = scanner.compare(legacy, restore, FILE_MAPPINGS);
    const report: string[] = [
        "# 🔬 Disparity Report",
        `Generated: ${new Date().toISOString()}`,
        "",
        ...result.reportLines
    ];

    await Bun.write(REPORT_FILE, report.join("\n"));
    logger.info(`✅ Report written to ${REPORT_FILE}`);
}

main();
