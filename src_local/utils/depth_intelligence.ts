import { readFile, exists } from "node:fs/promises";
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
    "analysis_engine_phd": "system_facade",
    "conflict_policy_phd": "system_facade",
    "scoring_engine_phd": "system_facade",
    "topology_engine_phd": "system_facade",
    "compliance_standard": "system_facade",
    "git_operations_phd": "system_facade",
    "veto_rules_phd": "system_facade",
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
    "compiler": "system_facade",
    "test_core_depth": "telemetry_excellence_engine",
    "test_score_calculator": "system_facade",
    "indexer": "system_facade",
    "parallel_test_executor": "telemetry_excellence_engine",
    "persona_loader": "system_facade",
    "resource_governor": "system_facade",
    "semantic_search": "discovery",
    "test_mapper": "telemetry_excellence_engine",
    "voice_engine": "briefing",
    "agents_registry": "audit_expert_engine"
};

/**
 * 🧠 Inteligência de Profundidade: Cálculos de Densidade Lógica e Soberania.
 */
export class DepthIntelligence {
    static async calculateDepthAudit(projectRoot: string, tsFiles: string[], pyFiles: string[], atomicUnits: FileAnalysis[]): Promise<DepthSummary> {
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

                const pyDepthPromises = pySources.map(p => this.getPythonDepth(p, atomicUnits));
                const pyDepths = await Promise.all(pyDepthPromises);
                const pyDepth = pyDepths.reduce((acc, d) => acc + d, 0);

                const tsDepth = await this.getTsDepth(sovPath, atomicUnits);

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

    private static async getPythonDepth(filePath: string, atomicUnits: FileAnalysis[]): Promise<number> {
        if (!await exists(filePath)) return 0;
        const content = await readFile(filePath, "utf-8");
        let score = 0;

        const logicKeywords = [" if ", " elif ", " for ", " while ", " def ", " class ", " try ", " except ", " with "];
        logicKeywords.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 20; // Increased from 5 to 20 for PhD resolution
        });

        const functional = [".match(", "ast.", "re.", "@property", "lambda", "yield"];
        functional.forEach(kw => {
            const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (content.match(new RegExp(escaped, "g")) || []).length;
            score += count * 15; // Increased from 3 to 15
        });

        score += this.getAtomicPoints(filePath, atomicUnits);
        return score;
    }

    private static async getTsDepth(filePath: string, atomicUnits: FileAnalysis[]): Promise<number> {
        if (!await exists(filePath)) return 0;
        const content = await readFile(filePath, "utf-8");

        // v7.2 PhD Upgrade: Detect script kind for proper JSX/TSX parsing
        const isTsx = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
        const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true,
            isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
        );

        let score = 0;

        const walk = (node: ts.Node) => {
            // Detect Delegate Pattern (Facade) - Heuristic
            // If method is one line and calls a property, it's a delegate.
            let isDelegate = false;
            if (ts.isMethodDeclaration(node) && node.body && node.body.statements.length === 1) {
                const stmt = node.body.statements[0];
                if (stmt && (ts.isReturnStatement(stmt) || ts.isExpressionStatement(stmt))) {
                    isDelegate = true;
                }
            }

            if (ts.isIfStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node) || ts.isSwitchStatement(node) || ts.isTryStatement(node)) {
                score += 30; // High Resolution Logic
            }
            if (ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
                if (isDelegate) {
                    score += 1; // Facade Delegation is cheap
                } else {
                    score += 25; // High Resolution Atomics
                }
            }
            if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isTypeReferenceNode(node) || ts.isEnumDeclaration(node)) {
                score += 15; // Type complexity
            }

            // v8.7: Data Density (Knowledge Weight)
            // Recognize constants, exports and property assignments as "Deep Knowledge"
            if (ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node) || ts.isExportAssignment(node)) {
                score += 5;
            }

            // v7.2: JSX Depth (Aggressive UI weight)
            if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
                score += 10;
            }

            // Only check text on leaf nodes (Identifiers) to avoid recursive parent inflation
            if (ts.isIdentifier(node)) {
                const text = node.text; // Use .text for identifiers, faster and cleaner
                if (text.includes("SyntaxKind") || text.includes("ast") || text.includes("Node")) {
                    score += 5; // Reduced from 15 (since it will match individual identifiers)
                }
                if (text.includes("shouldSkip") || text.includes("isSafe") || text.includes("veto") || text.includes("audit")) {
                    score += 3; // Reduced from 10
                }
            }
            ts.forEachChild(node, walk);
        };

        walk(sourceFile);

        // Adjust Atomic Points contextually
        // If the file consists mostly of delegates, don't penalize with atomic points
        let atomicScore = this.getAtomicPoints(filePath, atomicUnits);

        if (filePath.includes("governance_system") || filePath.includes("facade")) {
            atomicScore = Math.min(atomicScore, 10); // Cap atomic score for known facades
        }

        score += atomicScore;
        return score;
    }

    private static getAtomicPoints(filePath: string, atomicUnits: FileAnalysis[]): number {
        // v7.2: Hybrid Resolve (Absolute vs Relative vs Cross-Platform)
        const targetAbs = path.resolve(filePath).toLowerCase().replace(/\\/g, "/");

        const fileData = atomicUnits.find(f => {
            const fAbs = path.resolve(f.path).toLowerCase().replace(/\\/g, "/");
            return fAbs === targetAbs || targetAbs.endsWith(f.path.toLowerCase().replace(/\\/g, "/"));
        });

        return fileData ? fileData.units.length * 40 : 0;
    }
}
