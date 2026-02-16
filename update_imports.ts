import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname, sep } from "node:path";

const projectRoot = process.cwd();
const supportBase = join("src_local", "agents", "Support");

const mapping: Record<string, string> = {
    // Analysis
    "ast_intelligence": "Analysis",
    "structural_analyst": "Analysis",
    "parity_analyst": "Analysis",
    "pyramid_analyst": "Analysis",
    "logic_auditor": "Analysis",
    "source_code_parser": "Analysis",
    "semantic_context_analyst": "Analysis",
    "component_classifier": "Analysis",
    "connectivity_mapper": "Analysis",
    "discovery_agent": "Analysis",
    "dna_profiler": "Analysis",
    "meta_analysis_detector": "Analysis",
    "structural_auditor_supreme": "Analysis",
    "silent_error_detector": "Analysis",
    "coverage_auditor": "Analysis",
    // Diagnostics
    "health_synthesizer": "Diagnostics",
    "diagnostic_strategist": "Diagnostics",
    "audit_risk_engine": "Diagnostics",
    "score_calculator": "Diagnostics",
    "scoring_metrics_engine": "Diagnostics",
    "maturity_evaluator": "Diagnostics",
    "quality_analyst": "Diagnostics",
    "cognitive_analyst": "Diagnostics",
    // Reporting
    "report_formatter": "Reporting",
    "report_sections_engine": "Reporting",
    "battle_plan_formatter": "Reporting",
    "battle_plan_sections_engine": "Reporting",
    "markdown_auditor": "Reporting",
    "markdown_sanitizer": "Reporting",
    "markdown_structure_agent": "Reporting",
    "briefing_agent": "Reporting",
    // Security
    "security_sentinel_agent": "Security",
    "safety_definitions": "Security",
    "safety_supreme_judge": "Security",
    "obfuscation_hunter": "Security",
    "obfuscation_logic_engine": "Security",
    "obfuscation_cleaner_engine": "Security",
    // Automation
    "git_automaton": "Automation",
    "test_architect_agent": "Automation",
    "test_refiner": "Automation",
    "test_runner": "Automation",
    "testify_persona": "Automation",
    "infrastructure_assembler": "Automation",
    "validation_agent": "Automation",
    "topology_graph_agent": "Automation",
    "doc_gen_agent": "Automation",
    // Core
    "director": "Core",
    "healer": "Core",
    "healer_persona": "Core",
    "specialized_personas_hub": "Core",
    "memory_persistence": "Core",
    "penalty_engine": "Core",
    "telemetry_intent_judge": "Core",
    "integrity_guardian": "Core"
};

const agentNames = Object.keys(mapping);

function walk(dir: string, callback: (path: string) => void) {
    const files = readdirSync(dir);
    for (const file of files) {
        const path = join(dir, file);
        if (statSync(path).isDirectory()) {
            if (file === "node_modules" || file === ".git" || file === ".gemini") continue;
            walk(path, callback);
        } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            callback(path);
        }
    }
}

walk(projectRoot, (filePath) => {
    let content = readFileSync(filePath, "utf-8");
    let changed = false;

    // Normalize path to use forward slashes for internal logic
    const relFile = relative(projectRoot, filePath).replace(/\\/g, "/");
    const isInsideSupport = relFile.startsWith("src_local/agents/Support/") && relFile.split("/").length === 5;
    const myCategory = isInsideSupport ? relFile.split("/")[3] : null;

    // 1. PROJECT-WIDE: Update absolute-ish and distant relative imports
    // from ".../agents/Support/agent" -> from ".../agents/Support/Category/agent"
    for (const agent of agentNames) {
        const category = mapping[agent];

        // Match imports ending in the agent name, optionally with .ts
        // This handles:
        // - from "@/agents/Support/agent"
        // - from "../../agents/Support/agent"
        // - from "../../agents/Support/agent.ts"
        const regex = new RegExp(`(from\\s+["'])([^"']*\/agents\/Support\/)(${agent})(\.ts)?(["'])`, "g");
        if (regex.test(content)) {
            // Check if it already has the category
            const checkAlreadyFixed = new RegExp(`\/agents\/Support\/${category}\/${agent}`, "g");
            if (!checkAlreadyFixed.test(content)) {
                content = content.replace(regex, `$1$2${category}/$3$4$5`);
                changed = true;
            }
        }
    }

    // 2. INTERNAL Support/ files: Handle neighboring and external relative imports
    if (isInsideSupport && myCategory) {
        // Fix neighbors: from "./agent" -> from "../Category/agent" (if different category)
        for (const otherAgent of agentNames) {
            const otherCategory = mapping[otherAgent];
            const otherRegex = new RegExp(`(from\\s+["']\.\/)(${otherAgent})(\.ts)?(["'])`, "g");
            if (otherRegex.test(content)) {
                if (myCategory === otherCategory) {
                    // Keep ./ for same category
                } else {
                    // Change to ../Category/ for different category
                    content = content.replace(otherRegex, `$1../${otherCategory}/$2$3$4`);
                    changed = true;
                }
            }
        }

        // Fix external: from "../../core" -> from "../../../core"
        // Pattern: from "../.."
        if (content.includes('from "../..')) {
            content = content.replace(/(from\s+["']\.\.\/\.\.\/)([^"']+["'])/g, 'from "../../../$2');
            changed = true;
        }

        // and from "../core" (unlikely but possible) -> from "../../core"
        // But only if it's NOT pointing to another category (which we handled above)
        const coreUtilsRegex = /(from\s+["']\.\.\/)(core|utils|core|shared)([^"']+["'])/g;
        if (coreUtilsRegex.test(content)) {
            content = content.replace(coreUtilsRegex, 'from "../../$2$3');
            changed = true;
        }
    }

    if (changed) {
        writeFileSync(filePath, content);
        console.log(`✨ Fixed imports in: ${relFile}`);
    }
});

console.log("🚀 Refined Import update completed.");
