import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import type { FileAnalysis } from "./go_discovery_adapter.ts";

export interface DepthMetric {
    path: string;
    pyDepth: number;
    tsDepth: number;
    delta: number;
    status: "🚀 EVOLVED" | "⚠️ MAINTAINED" | "📉 SIMPLIFIED";
    evolution: string;
    pySources: string[];
}

export interface DepthSummary {
    stats: {
        EVOLVED: number;
        MAINTAINED: number;
        SIMPLIFIED: number;
    };
    metrics: DepthMetric[];
}

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

/**
 * 🧠 Inteligência de Profundidade: Cálculos de Densidade Lógica e Soberania.
 */
export class DepthIntelligence {
    static calculateDepthAudit(projectRoot: string, tsFiles: string[], pyFiles: string[], atomicUnits: FileAnalysis[]): DepthSummary {
        console.log("🧠 [DepthIntelligence] Iniciando calculateDepthAudit...");
        const legacyMap = this.buildLegacyMap(pyFiles);
        console.log(`🧠 [DepthIntelligence] LegacyMap construído com ${legacyMap.size} entradas.`);

        const metrics: DepthMetric[] = [];
        const stats = { EVOLVED: 0, MAINTAINED: 0, SIMPLIFIED: 0 };

        for (const sovPath of tsFiles) {
            try {
                const fileName = path.basename(sovPath, ".ts").toLowerCase();
                const pySources = legacyMap.get(fileName) || [];

                if (pySources.length === 0) {
                    const baseName = fileName.replace(/_?engine$/, "").replace(/_?agent$/, "").replace(/_?system$/, "");
                    const pySourcesRetry = legacyMap.get(baseName);
                    if (pySourcesRetry && pySourcesRetry.length > 0) pySources.push(...pySourcesRetry);
                }

                const pyDepth = pySources.reduce((acc, p) => acc + this.getPythonDepth(p, atomicUnits), 0);
                const tsDepth = this.getTsDepth(sovPath, atomicUnits);

                let status: DepthMetric["status"] = "⚠️ MAINTAINED";
                let evolution = "Paridade funcional preservada.";

                if (tsDepth > pyDepth * 1.5) {
                    status = "🚀 EVOLVED";
                    evolution = "Complexidade semântica e segurança aumentadas.";
                    stats.EVOLVED++;
                } else if (tsDepth < pyDepth * 0.8) {
                    status = "📉 SIMPLIFIED";
                    evolution = "Lógica consolidada (Risco de baixa profundidade).";
                    stats.SIMPLIFIED++;
                } else {
                    stats.MAINTAINED++;
                }

                metrics.push({
                    path: path.relative(projectRoot, sovPath).replace(/\\/g, "/"),
                    pyDepth,
                    tsDepth,
                    delta: tsDepth - pyDepth,
                    status,
                    evolution,
                    pySources
                });
            } catch (err) {
                console.error(`💥 Erro ao processar profundidade para ${sovPath}: ${err}`);
            }
        }

        return { stats, metrics };
    }

    private static buildLegacyMap(pyFiles: string[]): Map<string, string[]> {
        const map = new Map<string, string[]>();
        for (const pyFile of pyFiles) {
            const normName = path.basename(pyFile).toLowerCase().replace(/\.py$/, "").replace(/_?persona$/, "").replace(/_?agent$/, "");
            const target = LEGACY_ALIASES[normName] || normName;
            if (!map.has(target)) map.set(target, []);
            map.get(target)!.push(pyFile);
        }
        return map;
    }

    private static getPythonDepth(filePath: string, atomicUnits: FileAnalysis[]): number {
        if (!fs.existsSync(filePath)) return 0;
        const content = fs.readFileSync(filePath, "utf-8");
        let score = 0;

        const logicKeywords = [" if ", " elif ", " for ", " while ", " def ", " class ", " try ", " except ", " with "];
        logicKeywords.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 5;
        });

        const functional = [".match(", "ast.", "re.", "@property", "lambda", "yield"];
        functional.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 3;
        });

        score += this.getAtomicPoints(filePath, atomicUnits);
        return score;
    }

    private static getTsDepth(filePath: string, atomicUnits: FileAnalysis[]): number {
        if (!fs.existsSync(filePath)) return 0;
        const content = fs.readFileSync(filePath, "utf-8");
        const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
        let score = 0;

        const walk = (node: ts.Node) => {
            if (ts.isIfStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node) || ts.isSwitchStatement(node) || ts.isTryStatement(node)) {
                score += 10;
            }
            if (ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isClassDeclaration(node)) {
                score += 8;
            }
            if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isTypeReferenceNode(node) || ts.isEnumDeclaration(node)) {
                score += 5;
            }
            const text = node.getText();
            if (text.includes("SyntaxKind") || text.includes("this.ast") || text.includes("ts.Node")) {
                score += 4;
            }
            if (text.includes("shouldSkip") || text.includes("isSafe") || text.includes("veto") || text.includes("audit")) {
                score += 2;
            }
            ts.forEachChild(node, walk);
        };

        walk(sourceFile);
        score += this.getAtomicPoints(filePath, atomicUnits);
        return score;
    }

    private static getAtomicPoints(filePath: string, atomicUnits: FileAnalysis[]): number {
        const fileData = atomicUnits.find(f => path.resolve(f.path) === path.resolve(filePath));
        return fileData ? fileData.units.length * 15 : 0;
    }
}
