
import { join, relative, basename } from "path";
import { readdir, stat } from "fs/promises";
import { execSync } from "child_process";
import { existsSync } from "fs";

// Configuration
const LEGACY_ROOT = "legacy_restore/src_local";
const CURRENT_ROOT = "src_local";
const REPORT_FILE = "disparity_report.md";
const GO_SCANNER_PATH = "src_native\\go-scanner.exe";

// Known mappings (Legacy -> Current) for renamed files/classes
const FILE_MAPPINGS: Record<string, string> = {
    "git_automaton.py": "utils/git_client.ts",
    "markdown_sanitizer.py": "agents/Support/markdown_auditor.ts",
    "telemetry_intent_judge.py": "agents/Support/logic_auditor.ts",
    "telemetry_maturity_logic.py": "agents/Support/logic_auditor.ts",
    "silent_error_detector.py": "agents/Support/logic_auditor.ts",
    "meta_analysis_detector.py": "agents/Support/logic_auditor.ts",
    "call_safety_judge.py": "agents/Support/logic_auditor.ts",
    "safe_context_judge.py": "agents/Support/logic_auditor.ts",
    "resource_governor.py": "utils/system_sentinel.ts",
    "conflict_policy.py": "utils/conflict_policy.ts",
    "test_architect_agent.py": "agents/Support/test_architect_agent.ts", // Planned Port
    "doc_gen_agent.py": "agents/Support/doc_gen_agent.ts", // Planned Port
    "infrastructure_assembler.py": "agents/Support/infrastructure_assembler.ts", // Planned Port
    "memory_pruning_agent.py": "utils/memory_pruning_agent.ts",
    "audit_risk_engine.py": "agents/Support/logic_auditor.ts", // Risk mapping is now part of Logic/Veto
    "audit_scanner_engine.py": "core/audit_engine.ts", // Core logic moved here
    "veto_criteria_engine.py": "utils/veto_engine.ts",
    "veto_rules.py": "utils/veto_engine.ts",
    "veto_structural_engine.py": "utils/veto_engine.ts",
    "safety_heuristics.py": "agents/Support/logic_auditor.ts",
    "safety_assignment_engine.py": "agents/Support/logic_auditor.ts",
    "report_formatter.py": "core/diagnostic_finalizer.ts", // Reporting logic
    "report_sections_engine.py": "core/diagnostic_finalizer.ts"
};

// Files that are strictly Python-infrastructure related and NOT needed in TS/Bun
const IGNORE_LIST = [
    "ast_navigator.py", // TS has compiler API
    "ast_node_inspector.py", // TS has compiler API
    "ast_traversal_logic.py", // TS has compiler API
    "source_code_parser.py", // TS has compiler API
    "registry_compiler.py", // Dynamic import in TS is different
    "obfuscation_cleaner_engine.py", // Handled by ObfuscationHunter
    "logic_node_auditor.py" // Merged into LogicAuditor
];

interface AtomicUnit {
    type: "class" | "function";
    name: string;
    line: number;
}

interface FileAnalysis {
    path: string;
    exists: boolean;
    units: AtomicUnit[];
}

const PY_CLASS_REGEX = /^class\s+(\w+)/;
const PY_DEF_REGEX = /^\s*def\s+(\w+)/;

const TS_CLASS_REGEX = /^export\s+class\s+(\w+)|^class\s+(\w+)/;
const TS_METHOD_REGEX = /^\s*(?:public|private|protected|static|async)*\s*(\w+)\s*\(/;
const TS_FUNC_REGEX = /^export\s+function\s+(\w+)|^function\s+(\w+)|^const\s+(\w+)\s*=\s*\(|^const\s+(\w+)\s*=\s*function/;


async function scanDirectory(dir: string, root: string, isLegacy: boolean): Promise<FileAnalysis[]> {
    if (existsSync(GO_SCANNER_PATH)) {
        try {
            const cmd = `${GO_SCANNER_PATH} -dir "${dir}" -root "${root}" ${isLegacy ? "-legacy" : ""}`;
            const output = execSync(cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
            return JSON.parse(output);
        } catch (e) {
            console.error(`⚠️ Go Scanner failed: ${e}. Falling back to TS.`);
        }
    }

    // Fallback: Original TS implementation
    const results: FileAnalysis[] = [];
    // ... (logic remains same as fallback)
    try {
        const entries = await readdir(dir);
        for (const entry of entries) {
            if (entry === "__pycache__" || entry === "node_modules" || entry.startsWith(".")) continue;
            const fullPath = join(dir, entry);
            const info = await stat(fullPath);
            if (info.isDirectory()) {
                results.push(...await scanDirectory(fullPath, root, isLegacy));
            } else {
                const ext = isLegacy ? ".py" : ".ts";
                if (entry.endsWith(ext) && !entry.includes("__init__")) {
                    const relPath = relative(root, fullPath).replace(/\\/g, "/");
                    const content = await Bun.file(fullPath).text();
                    const units = isLegacy ? parsePython(content) : parseTypeScript(content);
                    results.push({ path: relPath, exists: true, units });
                }
            }
        }
    } catch (e) { }
    return results;
}

function parsePython(content: string): AtomicUnit[] {
    const units: AtomicUnit[] = [];
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        const classMatch = line.match(PY_CLASS_REGEX);
        if (classMatch && classMatch[1]) {
            units.push({ type: "class", name: classMatch[1], line: i + 1 });
        }
        const defMatch = line.match(PY_DEF_REGEX);
        if (defMatch && defMatch[1]) {
            if (!defMatch[1].startsWith("__")) {
                units.push({ type: "function", name: defMatch[1], line: i + 1 });
            }
        }
    }
    return units;
}

function parseTypeScript(content: string): AtomicUnit[] {
    const units: AtomicUnit[] = [];
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;

        const classMatch = line.match(TS_CLASS_REGEX);
        if (classMatch) {
            const name = classMatch[1] || classMatch[2];
            if (name) units.push({ type: "class", name: name, line: i + 1 });
        }

        const methodMatch = line.match(TS_METHOD_REGEX);
        if (methodMatch && methodMatch[1]) {
            const name = methodMatch[1];
            if (name !== "constructor" && name !== "if" && name !== "for" && name !== "while" && name !== "switch" && name !== "catch") {
                units.push({ type: "function", name: name, line: i + 1 });
            }
        }

        const funcMatch = line.match(TS_FUNC_REGEX);
        if (funcMatch) {
            const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4];
            if (name) units.push({ type: "function", name: name, line: i + 1 });
        }
    }
    return units;
}

async function main() {
    console.log("🔍 Scanning for Disparities...");
    const rootDir = process.cwd();

    // Resolve Absolute Paths for Logic
    const legRoot = join(rootDir, LEGACY_ROOT);
    const curRoot = join(rootDir, CURRENT_ROOT);

    const legacyFiles = await scanDirectory(legRoot, legRoot, true);
    const currentFiles = await scanDirectory(curRoot, curRoot, false);

    const reportLines: string[] = [];
    reportLines.push("# 📊 Atomic Disparity Report");
    reportLines.push(`**Date:** ${new Date().toISOString()}`);
    reportLines.push("");

    let missingFilesCount = 0;

    reportLines.push("## 1. Missing Files Analysis");


    for (const lFile of legacyFiles) {
        let mappedPath = lFile.path.replace(".py", ".ts");
        const filename = basename(lFile.path);

        // 0. Check Ignore List
        if (IGNORE_LIST.includes(filename)) continue;

        // Check Mappings
        let matchedCFile: FileAnalysis | undefined;

        if (FILE_MAPPINGS[filename]) {
            // Mapped file logic
            const targetPath = FILE_MAPPINGS[filename];
            // Try to find by partial path match since roots differ
            matchedCFile = currentFiles.find(c => c.path.endsWith(targetPath) || c.path === targetPath);
        } else {
            // Direct match check
            matchedCFile = currentFiles.find(c => c.path === mappedPath);
            if (!matchedCFile) {
                // Fuzzy match
                matchedCFile = currentFiles.find(c => basename(c.path) === basename(mappedPath));
            }
        }

        if (!matchedCFile) {
            reportLines.push(`- ❌ **${lFile.path}** MISSING`);
            missingFilesCount++;
        }
        if (matchedCFile) {
            // Atomic Logic Check
            const missingUnits: string[] = [];

            // Heuristic for unit matching
            lFile.units.forEach(lUnit => {
                if (lUnit.name === "perform_audit" || lUnit.name === "execute") return; // Interfaces

                // Normalization for comparison (snake_case -> camelCase)
                const snakeToCamel = lUnit.name.replace(/(_\w)/g, (m) => m[1].toUpperCase());

                const match = matchedCFile!.units.find(cUnit => {
                    return cUnit.name === lUnit.name ||
                        cUnit.name === snakeToCamel ||
                        cUnit.name.toLowerCase() === lUnit.name.toLowerCase().replace(/_/g, "");
                });

                if (!match) {
                    missingUnits.push(lUnit.name);
                }
            });

            if (missingUnits.length > 0) {
                reportLines.push(`- ⚠️ **${lFile.path}** -> **${matchedCFile.path}** (Partial Match)`);
                reportLines.push(`  - Missing Logic Atoms: ${missingUnits.join(", ")}`);
            }
        }
    }

    console.log(`Report generated with ${missingFilesCount} missing files.`);
    await Bun.write(REPORT_FILE, reportLines.join("\n"));
}

main();
