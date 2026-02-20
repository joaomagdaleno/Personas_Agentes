import { renameSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const baseDir = "src_local/agents/Support";

const categorization = {
    Analysis: [
        "ast_intelligence.ts",
        "structural_analyst.ts",
        "parity_analyst.ts",
        "pyramid_analyst.ts",
        "logic_auditor.ts",
        "source_code_parser.ts",
        "semantic_context_analyst.ts",
        "component_classifier.ts",
        "connectivity_mapper.ts",
        "discovery_agent.ts",
        "dna_profiler.ts",
        "meta_analysis_detector.ts",
        "structural_auditor_supreme.ts",
        "silent_error_detector.ts",
        "coverage_auditor.ts"
    ],
    Diagnostics: [
        "health_synthesizer.ts",
        "diagnostic_strategist.ts",
        "audit_risk_engine.ts",
        "score_calculator.ts",
        "scoring_metrics_engine.ts",
        "maturity_evaluator.ts",
        "quality_analyst.ts",
        "cognitive_analyst.ts"
    ],
    Reporting: [
        "report_formatter.ts",
        "report_sections_engine.ts",
        "battle_plan_formatter.ts",
        "battle_plan_sections_engine.ts",
        "markdown_auditor.ts",
        "markdown_sanitizer.ts",
        "markdown_structure_agent.ts",
        "briefing_agent.ts"
    ],
    Security: [
        "security_sentinel_agent.ts",
        "safety_definitions.ts",
        "safety_supreme_judge.ts",
        "obfuscation_hunter.ts",
        "obfuscation_logic_engine.ts",
        "obfuscation_cleaner_engine.ts"
    ],
    Automation: [
        "git_automaton.ts",
        "test_architect_agent.ts",
        "test_refiner.ts",
        "test_runner.ts",
        "testify_persona.ts",
        "infrastructure_assembler.ts",
        "validation_agent.ts",
        "topology_graph_agent.ts",
        "doc_gen_agent.ts"
    ],
    Core: [
        "director.ts",
        "healer.ts",
        "healer_persona.ts",
        "specialized_personas_hub.ts",
        "memory_persistence.ts",
        "penalty_engine.ts",
        "telemetry_intent_judge.ts",
        "integrity_guardian.ts"
    ]
};

for (const [category, files] of Object.entries(categorization)) {
    const categoryDir = join(baseDir, category);
    if (!existsSync(categoryDir)) {
        mkdirSync(categoryDir, { recursive: true });
        console.log(`📂 Created directory: ${categoryDir}`);
    }

    for (const file of files) {
        const source = join(baseDir, file);
        const destination = join(categoryDir, file);
        if (existsSync(source)) {
            try {
                renameSync(source, destination);
                console.log(`✅ Moved: ${file} -> ${category}/`);
            } catch (e) {
                console.error(`❌ Failed to move ${file}: ${e.message}`);
            }
        } else {
            // Check if already moved
            if (existsSync(destination)) {
                console.log(`ℹ️ Already moved: ${file}`);
            } else {
                console.warn(`⚠️ File not found: ${source}`);
            }
        }
    }
}
