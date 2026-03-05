import { readFile, exists } from "node:fs/promises";
import * as path from "node:path";
import winston from "winston";
import type { FileAnalysis } from "./go_discovery_adapter.ts";
import { TsDepthScorer } from "./strategies/depth/TsDepthScorer.ts";
import { PyDepthScorer } from "./strategies/depth/PyDepthScorer.ts";

const logger = winston.child({ module: "DepthIntelligence" });

export interface DepthMetric {
    path: string; pyDepth: number; tsDepth: number; delta: number;
    status: "🚀 EVOLVED" | "⚠️ MAINTAINED" | "📉 SIMPLIFIED";
    evolution: string; pySources: string[];
}

export interface DepthSummary {
    stats: { EVOLVED: number; MAINTAINED: number; SIMPLIFIED: number; };
    metrics: DepthMetric[];
}

const LEGACY_ALIASES: Record<string, string> = {
    "reflex_engine_phd": "reflex_engine", "ast_navigator": "ast_intelligence",
    "ast_node_inspector": "ast_intelligence", "ast_traversal_logic": "ast_intelligence",
    "audit_risk_engine": "audit_expert_engine", "audit_scanner_engine": "audit_expert_engine",
    "safe_context_judge": "safety_supreme_judge", "safety_heuristics": "safety_supreme_judge",
    "safety_assignment_engine": "safety_supreme_judge", "safety_navigator": "safety_supreme_judge",
    "rule_definition_judge": "safety_supreme_judge", "obfuscation_cleaner_engine": "vulnerability_heuristic",
    "telemetry_intent_judge": "telemetry_excellence_engine", "telemetry_maturity_logic": "telemetry_excellence_engine",
    "intent_heuristics_engine": "telemetry_excellence_engine", "test_discovery_logic": "telemetry_excellence_engine",
    "analysis_engine_phd": "system_facade", "conflict_policy_phd": "system_facade",
    "scoring_engine_phd": "system_facade", "topology_engine_phd": "system_facade",
    "compliance_standard": "system_facade", "git_operations_phd": "system_facade",
    "veto_rules_phd": "system_facade", "test_bolt": "specialized_personas_hub",
    "test_director": "specialized_personas_hub", "test_sentinel": "specialized_personas_hub",
    "test_vault": "specialized_personas_hub", "logic_node_auditor": "structural_auditor_supreme",
    "silent_error_detector": "structural_auditor_supreme", "semantic_context_analyst": "structural_auditor_supreme",
    "meta_analysis_detector": "structural_auditor_supreme", "call_safety_judge": "safety_supreme_judge",
    "code_inspector": "structural_auditor_supreme", "line_veto": "structural_auditor_supreme",
    "metrics_assembler": "structural_auditor_supreme", "registry_compiler": "audit_expert_engine",
    "report_sections_engine": "report_formatter", "test_navigator": "ast_intelligence",
    "veto_criteria_engine": "structural_auditor_supreme", "veto_rules": "structural_auditor_supreme",
    "veto_structural_engine": "structural_auditor_supreme", "web_insight": "discovery",
    "compiler": "system_facade", "test_core_depth": "telemetry_excellence_engine",
    "test_score_calculator": "system_facade", "indexer": "system_facade",
    "parallel_test_executor": "telemetry_excellence_engine", "persona_loader": "system_facade",
    "resource_governor": "system_facade", "semantic_search": "discovery",
    "test_mapper": "telemetry_excellence_engine", "voice_engine": "briefing",
    "agents_registry": "audit_expert_engine"
};

/**
 * 🧠 Inteligência de Profundidade: Cálculos de Densidade Lógica e Soberania.
 */
export class DepthIntelligence {
    static async calculateDepthAudit(projectRoot: string, tsFiles: string[], pyFiles: string[], atomicUnits: FileAnalysis[]): Promise<DepthSummary> {
        const legacyMap = this.buildLegacyMap(pyFiles);
        const metrics: DepthMetric[] = [];
        const stats = { EVOLVED: 0, MAINTAINED: 0, SIMPLIFIED: 0 };

        for (const sovPath of tsFiles) {
            await this.processFileDepth(sovPath, projectRoot, legacyMap, atomicUnits, metrics, stats);
        }
        return { stats, metrics };
    }

    private static async processFileDepth(sovPath: string, projectRoot: string, legacyMap: Map<string, string[]>, atomicUnits: FileAnalysis[], metrics: DepthMetric[], stats: any) {
        try {
            const fileName = path.basename(sovPath, ".ts").toLowerCase();
            const pySources = this.findLegacySources(fileName, legacyMap);

            const pyDepths = await Promise.all(pySources.map(p => PyDepthScorer.calculate(p, atomicUnits, this.getAtomicPoints)));
            const pyDepth = pyDepths.reduce((acc, d) => acc + d, 0);
            const tsDepth = await TsDepthScorer.calculate(sovPath, atomicUnits, this.getAtomicPoints);

            const { status, evolution } = this.determineEvolution(pyDepth, tsDepth);
            const statusKey = status.split(" ")[1] as keyof typeof stats;
            stats[statusKey]++;

            metrics.push({
                path: path.relative(projectRoot, sovPath).replace(/\\/g, "/"),
                pyDepth, tsDepth, delta: tsDepth - pyDepth,
                status: status as DepthMetric["status"],
                evolution, pySources
            });
        } catch (err) {
            logger.error(`💥 Erro depths ${sovPath}: ${err}`);
        }
    }

    private static findLegacySources(fileName: string, legacyMap: Map<string, string[]>): string[] {
        let sources = legacyMap.get(fileName) || [];
        if (sources.length === 0) {
            const baseName = fileName.replace(/_?(engine|agent|system)$/, "");
            sources = legacyMap.get(baseName) || [];
        }
        return sources;
    }

    private static determineEvolution(py: number, ts: number): { status: string, evolution: string } {
        if (ts > py * 1.5) {
            return { status: "🚀 EVOLVED", evolution: "Complexidade semântica e segurança aumentadas." };
        }
        if (ts < py * 0.8) {
            return { status: "📉 SIMPLIFIED", evolution: "Lógica consolidada (Risco de baixa profundidade)." };
        }
        return { status: "⚠️ MAINTAINED", evolution: "Paridade funcional preservada." };
    }

    private static buildLegacyMap(pyFiles: string[]): Map<string, string[]> {
        const map = new Map<string, string[]>();
        for (const pyFile of pyFiles) {
            this.addFileToLegacyMap(pyFile, map);
        }
        return map;
    }

    private static addFileToLegacyMap(pyFile: string, map: Map<string, string[]>) {
        const normName = path.basename(pyFile).toLowerCase().replace(/\.py$/, "").replace(/_?(persona|agent)$/, "");
        const target = LEGACY_ALIASES[normName] || normName;
        if (!map.has(target)) map.set(target, []);
        map.get(target)!.push(pyFile);
    }

    private static getAtomicPoints(filePath: string, atomicUnits: FileAnalysis[]): number {
        const targetAbs = path.resolve(filePath).toLowerCase().replace(/\\/g, "/");
        const fileData = atomicUnits.find(f => {
            const fAbs = path.resolve(f.path).toLowerCase().replace(/\\/g, "/");
            return fAbs === targetAbs || targetAbs.endsWith(f.path.toLowerCase().replace(/\\/g, "/"));
        });
        return fileData ? fileData.units.length * 40 : 0;
    }
}
