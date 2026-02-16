
import { FileSystemScanner } from "./src_local/utils/file_system_scanner.ts";
import { Path } from "./src_local/core/path_utils.ts";

const scanner = new FileSystemScanner(process.cwd(), { shouldIgnore: () => false, isAnalyable: () => true });

const testDirs = [
    ".agent",
    ".agent/skills",
    ".agent/skills/skills",
    ".agent/skills/scripts",
    ".agent/skills/skills/fast-android-build",
    "src_local",
    "node_modules"
];

console.log("Testing isForbiddenDir:");
for (const d of testDirs) {
    const fullPath = new Path(process.cwd()).join(d).toString();
    console.log(`Dir: ${d.padEnd(40)} -> Forbidden: ${scanner['isForbiddenDir'](fullPath)}`);
}

console.log("\nTesting shouldSkip:");
const testFiles = [
    ".agent/skills/scripts/skills_manager.py",
    ".agent/skills/skills/fast-android-build/SKILL.md",
    "src_local/core/orchestrator.ts"
];

for (const f of testFiles) {
    const fullPath = new Path(process.cwd()).join(f);
    const skipped = await scanner.shouldSkip(fullPath);
    console.log(`File: ${f.padEnd(40)} -> Skipped: ${skipped}`);
}
