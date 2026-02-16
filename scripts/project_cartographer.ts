// @ts-nocheck
/**
 * Project Cartographer: Sovereign vs Shadow Mapping
 * Scans the entire project to create a comprehensive inventory of files.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { ParityAnalyst } from "../src_local/agents/Support/parity_analyst.ts";

const ROOTS = {
    SOVEREIGN: "src_local",
    SHADOW: "legacy_restore",
    ROOT_SCRIPTS: "scripts",
    NATIVE: "src_native"
};

const IGNORE_DIRS = ["node_modules", ".git", ".idea", ".vscode", "__pycache__", "dist", "build", "coverage", ".gemini", "artifacts"];
const IGNORE_FILES = [".DS_Store", "Thumbs.db"];

interface FileEntry {
    path: string;
    name: string;
    extension: string;
    category: "Agent" | "Core" | "Interface" | "Util" | "Script" | "Test" | "Config" | "Doc" | "GoModule" | "Other";
    size: number;
    stack?: string; // Flutter, Kotlin, Python, TypeScript, Go
    parity?: number; // 0-100 score vs Legacy
    legacyMatch?: string; // Path to legacy match
}

interface ZoneMap {
    name: string;
    root: string;
    files: FileEntry[];
}

function getCategory(filePath: string, fileName: string): FileEntry["category"] {
    const lowerPath = filePath.toLowerCase();

    if (lowerPath.includes("tests") || fileName.startsWith("test_") || fileName.endsWith(".test.ts")) return "Test";
    if (lowerPath.includes("agents") || fileName.endsWith("Persona.ts") || fileName.endsWith("_persona.py")) return "Agent";
    if (lowerPath.includes("core")) return "Core";
    if (lowerPath.includes("interface")) return "Interface";
    if (lowerPath.includes("utils")) return "Util";
    if (fileName.endsWith(".go") || fileName === "go.mod") return "GoModule";
    if (lowerPath.includes("scripts") || fileName.endsWith(".ts") || fileName.endsWith(".py") || fileName.endsWith(".ps1") || fileName.endsWith(".sh")) return "Script";
    if (fileName.endsWith(".json") || fileName.endsWith(".yaml") || fileName.endsWith(".yml") || fileName.endsWith(".toml") || fileName.endsWith(".ini")) return "Config";
    if (fileName.endsWith(".md") || fileName.endsWith(".txt")) return "Doc";

    return "Other";
}

function getStack(filePath: string, fileName: string): string | undefined {
    if (fileName.endsWith(".go")) return "Go";
    if (filePath.includes("TypeScript")) return "TypeScript";
    if (filePath.includes("Python")) return "Python";
    if (filePath.includes("Kotlin")) return "Kotlin";
    if (filePath.includes("Flutter")) return "Flutter";

    // Fallback based on extension
    if (fileName.endsWith(".ts")) return "TypeScript";
    if (fileName.endsWith(".py")) return "Python";

    return undefined;
}

function scanDirectory(currentPath: string, rootIdx: string): FileEntry[] {
    let results: FileEntry[] = [];

    if (!fs.existsSync(currentPath)) return results;

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
            if (IGNORE_DIRS.includes(entry.name)) continue;
            results = results.concat(scanDirectory(fullPath, rootIdx));
        } else {
            if (IGNORE_FILES.includes(entry.name)) continue;

            const category = getCategory(fullPath, entry.name);
            let finalCategory = category;
            // Refine Script/Util
            if (category === "Other" && (entry.name.endsWith(".ts") || entry.name.endsWith(".py"))) {
                finalCategory = "Util";
            }

            results.push({
                path: fullPath.replace(/\\/g, "/"),
                name: entry.name,
                extension: path.extname(entry.name),
                category: finalCategory,
                size: fs.statSync(fullPath).size,
                stack: getStack(fullPath, entry.name)
            });
        }
    }
    return results;
}

function analyzeParityAndGaps(sovereign: FileEntry[], shadow: FileEntry[]) {
    const gaps: { category: string, legacyFile: string, status: string }[] = [];
    const analyst = new ParityAnalyst();

    // Helper to strip extension and "persona"/"agent" suffix for matching
    const normalize = (name: string) => name.toLowerCase().replace(/\.(py|ts|go|json|yaml|yml)$/, "").replace(/_?persona$/, "").replace(/_?agent$/, "");

    const LEGACY_ALIASES: Record<string, string> = {
        "reflex_engine_phd": "reflex_engine",
        "ast_navigator": "ast_intelligence",
        "ast_node_inspector": "ast_intelligence",
        "ast_traversal_logic": "ast_intelligence",
        "audit_risk_engine": "audit_expert_engine",
        "audit_scanner_engine": "audit_expert_engine",
        "safe_context_judge": "safety_supreme_judge",
        "safety_heuristics": "safety_supreme_judge",
        "safety_assignment_engine": "safety_supreme_judge",
        "safety_navigator": "safety_supreme_judge",
        "rule_definition_judge": "safety_supreme_judge",
        "obfuscation_cleaner_engine": "vulnerability_heuristic",
        "telemetry_intent_judge": "telemetry_excellence_engine",
        "telemetry_maturity_logic": "telemetry_excellence_engine",
        "intent_heuristics_engine": "telemetry_excellence_engine",
        "test_discovery_logic": "telemetry_excellence_engine",
        "analysis_engine_phd": "phd_governance_system",
        "conflict_policy_phd": "phd_governance_system",
        "scoring_engine_phd": "phd_governance_system",
        "topology_engine_phd": "phd_governance_system",
        "compliance_standard": "phd_governance_system",
        "git_operations_phd": "phd_governance_system",
        "veto_rules_phd": "phd_governance_system",
        "test_bolt": "specialized_personas_hub",
        "test_director": "specialized_personas_hub",
        "test_sentinel": "specialized_personas_hub",
        "test_vault": "specialized_personas_hub",
        "logic_node_auditor": "structural_auditor_supreme",
        "silent_error_detector": "structural_auditor_supreme",
        "semantic_context_analyst": "structural_auditor_supreme",
        "meta_analysis_detector": "structural_auditor_supreme",
        "call_safety_judge": "safety_supreme_judge",
        "code_inspector": "structural_auditor_supreme",
        "line_veto": "structural_auditor_supreme",
        "metrics_assembler": "structural_auditor_supreme",
        "registry_compiler": "audit_expert_engine",
        "report_sections_engine": "report_formatter",
        "test_navigator": "ast_intelligence",
        "veto_criteria_engine": "structural_auditor_supreme",
        "veto_rules": "structural_auditor_supreme",
        "veto_structural_engine": "structural_auditor_supreme",
        "web_insight": "discovery",
        "compiler": "phd_governance_system",
        "test_core_depth": "telemetry_excellence_engine",
        "test_score_calculator": "phd_governance_system",
        "indexer": "phd_governance_system",
        "parallel_test_executor": "telemetry_excellence_engine",
        "persona_loader": "phd_governance_system",
        "resource_governor": "phd_governance_system",
        "semantic_search": "discovery",
        "test_mapper": "telemetry_excellence_engine",
        "voice_engine": "briefing",
        "agents_registry": "audit_expert_engine"
    };

    // Create a map of normalized sovereign names to entries
    const sovMap = new Map<string, FileEntry>();
    sovereign.forEach(f => sovMap.set(normalize(f.name), f));

    // 1. Check Shadow vs Sovereign for Gaps and Parity
    for (const shadowFile of shadow) {
        // Only care about Agents, Core, Utils for Comparison
        if (!["Agent", "Core", "Util"].includes(shadowFile.category)) continue;
        if (shadowFile.name.startsWith("__")) continue;

        let normName = normalize(shadowFile.name);

        // Apply Aliases
        if (LEGACY_ALIASES[normName]) {
            normName = LEGACY_ALIASES[normName]!;
        }

        const sovMatch = sovMap.get(normName);

        if (!sovMatch) {
            gaps.push({
                category: shadowFile.category,
                legacyFile: shadowFile.name,
                status: "❌ MISSING IN SOVEREIGN"
            });
        } else {
            // Compute Parity Score
            const score = analyst.compareFiles(shadowFile.path, sovMatch.path);
            sovMatch.parity = score;
            sovMatch.legacyMatch = shadowFile.path;
        }
    }
    return gaps;
}

function generateReport(sovereign: ZoneMap, shadow: ZoneMap, scripts: ZoneMap, native: ZoneMap) {
    const reportPath = "project_gap_analysis.md";
    const dataPath = "project_map.json";

    // Combine all sovereign territories for analysis
    const allSovereign = [...sovereign.files, ...scripts.files, ...native.files];

    // Compute Parity & Gaps
    const gaps = analyzeParityAndGaps(allSovereign, shadow.files);

    // Save Data JSON for Diagnostic
    const mapData = {
        timestamp: new Date().toISOString(),
        sovereign: allSovereign, // Now enriched with parity scores
        shadow: shadow.files,
        gaps: gaps
    };
    fs.writeFileSync(dataPath, JSON.stringify(mapData, null, 2));
    console.log(`🗺️ [Cartographer] Mapa de dados salvo em: ${dataPath}`);

    let md = "# 🗺️ Project Cartographer: Gap Analysis (Multi-Language)\n\n";
    md += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
    md += `**Escopo:** Mapeamento de Gaps entre Legacy e Sovereign (Sovereign + Root Scripts + Native).\n\n`;

    // Language Distribution
    const langs = allSovereign.reduce((acc, f) => {
        const s = f.stack || "Unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    md += "## 📐 Arquitetura Tríade (3 Linguagens)\n";
    md += "Detecção de componentes por linguagem no território Soberano:\n\n";
    md += "| Linguagem | Arquivos | Papel Provável |\n| :--- | :---: | :--- |\n";
    md += `| **TypeScript** | ${langs["TypeScript"] || 0} | Lógica Core, Agentes, Ferramentas |\n`;
    md += `| **Python** | ${langs["Python"] || 0} | Interfaces Legadas, IA Pesada, Scripts |\n`;
    md += `| **Go** | ${langs["Go"] || 0} | Performance Crítica, System Tray, Scanners |\n`;
    md += "\n";

    // Parity Scores (New Section)
    md += "## 📊 Nível de Paridade (Sovereign Files)\n";
    md += "Arquivos migrados com score de paridade calculado (Atomic Fingerprint).\n\n";
    md += "| Arquivo Sovereign | Match Legacy | Paridade |\n| :--- | :--- | :---: |\n";

    const scoredFiles = allSovereign.filter(f => f.parity !== undefined).sort((a, b) => (b.parity || 0) - (a.parity || 0)); // Sort High to Low
    for (const f of scoredFiles) {
        const icon = f.parity === 100 ? "✅" : (f.parity! > 80 ? "⚠️" : "🚨");
        // Limit path length in display
        const legName = path.basename(f.legacyMatch || "");
        md += `| \`${f.name}\` | \`${legName}\` | ${icon} ${f.parity}% |\n`;
    }
    md += "\n";

    // Gap Analysis Table
    md += "## 🕳️ Análise de Lacunas (Missing Systems)\n";
    md += "Arquivos presentes no `legacy_restore` mas sem equivalente direto no `Sovereign`.\n\n";

    const gapsByCat = groupBy(gaps, "category");

    for (const cat of Object.keys(gapsByCat)) {
        md += `### ${cat} Missing\n`;
        md += "| Legacy File | Diagnóstico |\n| :--- | :--- |\n";
        for (const g of gapsByCat[cat]) {
            md += `| \`${g.legacyFile}\` | ${g.status} |\n`;
        }
        md += "\n";
    }

    fs.writeFileSync(reportPath, md);
    console.log(`Gap Analysis gerado em: ${reportPath}`);
}

function groupBy(array: any[], key: string) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}

// Main Execution
console.log("🗺️ Iniciando Project Cartographer...");
const sovereignFiles = scanDirectory(ROOTS.SOVEREIGN, "sovereign");
const shadowFiles = scanDirectory(ROOTS.SHADOW, "shadow");
const scriptsFiles = scanDirectory(ROOTS.ROOT_SCRIPTS, "scripts");
const nativeFiles = scanDirectory(ROOTS.NATIVE, "native");

const sovereignMap: ZoneMap = { name: "Sovereign Territory", root: ROOTS.SOVEREIGN, files: sovereignFiles };
const shadowMap: ZoneMap = { name: "Shadow Lands", root: ROOTS.SHADOW, files: shadowFiles };
const scriptsMap: ZoneMap = { name: "Root Scripts", root: ROOTS.ROOT_SCRIPTS, files: scriptsFiles };
const nativeMap: ZoneMap = { name: "Native Territory", root: ROOTS.NATIVE, files: nativeFiles };

generateReport(sovereignMap, shadowMap, scriptsMap, nativeMap);
