
import { readdir, readFile, stat } from "fs/promises";
import { join, relative, basename, extname } from "path";
import * as ts from "typescript";
import winston from "winston";

// --- Configuration ---
const LEGACY_ROOT = join(process.cwd(), "legacy_restore");
const RESTORE_ROOT = join(process.cwd(), "src_local");
const REPORT_FILE = "deep_disparity_report.md";

// Configure Logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
});

// --- Mappings ---
const FILE_MAPPINGS: Record<string, string> = {
    // Agents
    "structural_analyst.py": "agents/Support/structural_analyst.ts",
    "integrity_guardian.py": "agents/Support/integrity_guardian.ts",
    "connectivity_mapper.py": "agents/Support/connectivity_mapper.ts",
    "parity_analyst.py": "agents/Support/parity_analyst.ts",
    "test_architect_agent.py": "agents/Support/test_architect_agent.ts",
    "doc_gen_agent.py": "agents/Support/doc_gen_agent.ts",
    "diagnostic_strategist.py": "agents/Support/diagnostic_strategist.ts",
    "healer.py": "agents/Support/healer_persona.ts",
    "test_refiner.py": "agents/Support/test_refiner.ts",
    "infrastructure_assembler.py": "agents/Support/infrastructure_assembler.ts",
    "logic_auditor.py": "agents/Support/logic_auditor.ts",
    "markdown_auditor.py": "agents/Support/markdown_auditor.ts",

    // Core
    "validator.py": "core/validator.ts",
    "audit_engine.py": "core/audit_engine.ts",

    // Utils
    "maintenance_engine_phd.py": "utils/maintenance_engine_phd.ts",
    "veto_engine.py": "utils/veto_engine.ts",
    "task_executor.py": "utils/task_executor.ts",
    "cognitive_engine.py": "utils/cognitive_engine.ts",

    // One-to-Many or Merged (Manual checks logic below handles this roughly, but explicit mapping helps)
    "audit_risk_engine.py": "agents/Support/logic_auditor.ts", // Merged
    "audit_scanner_engine.py": "agents/Support/logic_auditor.ts", // Merged
};

const IGNORE_LIST = [
    "__init__.py",
    "setup.py",
    "requirements.txt",
    "main_gui.py", // GUI handled separately
    "gui_native.py",
    "shadow_tray.py",
    "launch_dashboard.py",
    "logging_config.py", // Configs
    "safety_definitions.py", // Data files
    "persona_manifest.json"
];

// --- Types ---
interface AtomicUnit {
    type: "class" | "function" | "method";
    name: string;
    parent?: string; // For methods
    line?: number;
}

interface FileAnalysis {
    path: string;
    units: AtomicUnit[];
}

// --- Parsers ---

/**
 * Regex-based Python Parser (Simple but effective for atoms)
 */
function parsePython(content: string): AtomicUnit[] {
    const units: AtomicUnit[] = [];
    const lines = content.split("\n");
    let currentClass: string | null = null;
    let currentIndent = 0;

    const classRegex = /^(\s*)class\s+(\w+)/;
    const defRegex = /^(\s*)def\s+(\w+)/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match Class
        const classMatch = line.match(classRegex);
        if (classMatch) {
            const indent = classMatch[1].length;
            currentClass = classMatch[2];
            currentIndent = indent;
            units.push({ type: "class", name: currentClass, line: i + 1 });
            continue;
        }

        // Match Function/Method
        const defMatch = line.match(defRegex);
        if (defMatch) {
            const indent = defMatch[1].length;
            const name = defMatch[2];

            if (currentClass && indent > currentIndent) {
                // Method
                units.push({ type: "method", name: name, parent: currentClass, line: i + 1 });
            } else {
                // Function or new class context (reset if indent matches outer)
                if (currentClass && indent <= currentIndent) {
                    currentClass = null;
                }
                units.push({ type: "function", name: name, line: i + 1 });
            }
        }
    }
    return units;
}

/**
 * Typescript Parser (using TS Compiler API for accuracy)
 */
function parseTypeScript(content: string, filePath: string): AtomicUnit[] {
    const units: AtomicUnit[] = [];
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    function visit(node: ts.Node) {
        if (ts.isClassDeclaration(node) && node.name) {
            const className = node.name.text;
            units.push({ type: "class", name: className });

            // Methods
            node.members.forEach(member => {
                if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
                    units.push({ type: "method", name: member.name.text, parent: className });
                }
            });
        } else if (ts.isFunctionDeclaration(node) && node.name) {
            units.push({ type: "function", name: node.name.text });
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return units;
}

// --- Scanner Logic ---

async function scanDirectory(dir: string, root: string, isLegacy: boolean): Promise<FileAnalysis[]> {
    const results: FileAnalysis[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relPath = relative(root, fullPath).replace(/\\/g, "/");

        if (entry.isDirectory()) {
            if (entry.name === "__pycache__" || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            results.push(...await scanDirectory(fullPath, root, isLegacy));
        } else {
            // Filter
            if (isLegacy && !entry.name.endsWith(".py")) continue;
            if (!isLegacy && !entry.name.endsWith(".ts")) continue;
            if (IGNORE_LIST.includes(entry.name)) continue;

            const content = await readFile(fullPath, "utf-8");
            const units = isLegacy ? parsePython(content) : parseTypeScript(content, fullPath);
            results.push({ path: relPath, units });
        }
    }
    return results;
}

// --- Main ---

async function main() {
    logger.info("🚀 Starting Deep Method-Level Disparity Scan...");

    const legacyFiles = await scanDirectory(LEGACY_ROOT, LEGACY_ROOT, true);
    const restoreFiles = await scanDirectory(RESTORE_ROOT, RESTORE_ROOT, false);

    logger.info(`📊 Legacy Files: ${legacyFiles.length}`);
    logger.info(`📊 Restore Files: ${restoreFiles.length}`);

    const reportLines: string[] = [];
    reportLines.push("# 🔬 Deep Method-Level Disparity Report");
    reportLines.push(`Generated: ${new Date().toISOString()}`);
    reportLines.push("");

    let missingFilesCount = 0;
    let methodGapsCount = 0;

    // 1. Analyze Mapped Files
    reportLines.push("## 1. Component & Method Gaps");

    for (const lFile of legacyFiles) {
        const lName = basename(lFile.path);

        // Find mapped TS file
        let tsPath = FILE_MAPPINGS[lName];
        let tFile: FileAnalysis | undefined;

        if (tsPath) {
            tFile = restoreFiles.find(f => f.path === tsPath || f.path.endsWith(tsPath));
        } else {
            // Auto-matcher heuristic
            const tsName = lName.replace(".py", ".ts")
                .replace(/_/g, "")
                .toLowerCase();

            tFile = restoreFiles.find(f => {
                const cleanName = basename(f.path).replace(".ts", "").replace(/_/g, "").toLowerCase();
                return cleanName === tsName || cleanName === tsName.replace("agent", "") || cleanName === tsName + "agent";
            });
        }

        if (!tFile) {
            reportLines.push(`### 🔴 MISSING FILE: \`${lFile.path}\``);
            reportLines.push("- No corresponding TypeScript file found.");
            missingFilesCount++;
        } else {
            // Method Level Compare
            const missingMethods: string[] = [];
            const lMethods = lFile.units.filter(u => u.type === "method" && !u.name.startsWith("__")); // Ignore magic methods
            const tMethods = tFile.units.filter(u => u.type === "method");

            for (const lm of lMethods) {
                // Heuristic Name Match (snake_case to camelCase)
                const camelName = lm.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

                const match = tMethods.find(tm =>
                    tm.name === lm.name ||
                    tm.name === camelName ||
                    tm.name.toLowerCase() === lm.name.replace(/_/g, "").toLowerCase()
                );

                if (!match) {
                    // Check if it's a known "merged" or "renamed" method (ignore simple getters/setters/helpers)
                    if (["reason_about_objective", "perform_audit", "get_system_prompt"].includes(lm.name)) continue; // Base class methods often changed
                    missingMethods.push(`${lm.parent}.${lm.name}`);
                }
            }

            if (missingMethods.length > 0) {
                reportLines.push(`### ⚠️ Gaps in \`${lName}\` -> \`${basename(tFile.path)}\``);
                missingMethods.forEach(m => reportLines.push(`- [ ] Missing Method: \`${m}\``));
                methodGapsCount += missingMethods.length;
            }
        }
    }

    reportLines.push("");
    reportLines.push("## 2. Summary");
    reportLines.push(`- **Legacy Files Scanned**: ${legacyFiles.length}`);
    reportLines.push(`- **Missing Files**: ${missingFilesCount}`);
    reportLines.push(`- **Method/Logic Gaps**: ${methodGapsCount}`);

    if (missingFilesCount === 0 && methodGapsCount === 0) {
        reportLines.push("");
        reportLines.push("✅ **FULL PARITY ACHIEVED!**");
    }

    await Bun.write(REPORT_FILE, reportLines.join("\n"));
    logger.info(`✅ Scan complete. Report written to ${REPORT_FILE}`);
}

main();
