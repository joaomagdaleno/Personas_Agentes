import winston from "winston";
import { ScoreCalculator } from "./score_calculator.ts";

const logger = winston.child({ module: "HealthSynthesizer" });

/**
 * 🩺 HealthSynthesizer — PhD in System Health Analysis & 360 Diagnostics
 * Analista de Saúde Sistêmica e Métricas PhD.
 */
export class HealthSynthesizer {
    private calculator: ScoreCalculator;

    constructor() {
        this.calculator = new ScoreCalculator();
    }

    synthesize360(context: any, orchestratorMetrics: any, orchestratorPersonas: any[], stabilityLedger: any, qaData: any): any {
        const mapData = context.map || {};
        const allAlerts = orchestratorMetrics.all_findings || [];

        // 1. Score & Calculations (Delegated)
        const hPacket = this.calculator.calculateFinalScore(mapData, allAlerts, qaData);

        // 2. Specialized Filters
        const darkMatter = this.getDarkMatter(mapData);
        const brittlePoints = this.getBrittlePoints(mapData, qaData, stabilityLedger);

        return {
            objective: context.identity?.core_mission || "UNKNOWN",
            health_score: hPacket.score,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            persona_maturity: this.getMaturity(orchestratorPersonas),
            parity: context.parity || {},
            ledger: stabilityLedger?.ledger || {},
            pyramid: qaData?.pyramid || {},
            test_execution: qaData?.execution || {},
            test_quality_matrix: qaData?.matrix || [],
            efficiency: context.efficiency || {},
            map: mapData,
            total_issues: allAlerts.length,
            is_external: context.identity?.is_external || false,
            dark_matter: darkMatter,
            brittle_points: brittlePoints,
            health_breakdown: hPacket.breakdown,
            blind_spots: Object.entries(mapData)
                .filter(([, i]: [string, any]) => i.silent_error)
                .map(([f]) => f)
        };
    }

    private getMaturity(personas: any[]): string {
        const avg = personas.reduce((sum, p) => sum + (p.experience || 0), 0) / Math.max(1, personas.length);
        return avg > 80 ? "VETERAN" : (avg > 50 ? "ELITE" : "RECRUIT");
    }

    private getDarkMatter(mapData: Record<string, any>): string[] {
        const core = ["AGENT", "CORE", "LOGIC", "UTIL"];
        return Object.entries(mapData)
            .filter(([f, i]) => !i.has_test && (core.includes(i.component_type) || (i.complexity || 1) > 1))
            .map(([f]) => f);
    }

    private getBrittlePoints(mapData: Record<string, any>, qaData: any, ledger: any): string[] {
        const core = ["AGENT", "CORE", "LOGIC", "UTIL"];
        const shallow = new Set(
            (qaData?.matrix || [])
                .filter((m: any) => m.test_status === "SHALLOW")
                .map((m: any) => m.file)
        );

        const relevant = Object.entries(mapData).filter(([f]) => !f.endsWith("__init__.py"));
        const logical = relevant.filter(([f, i]) => core.includes(i.component_type) || (i.complexity || 1) > 1);

        const ledgerData = ledger?.ledger || {};

        return logical
            .filter(([f, i]) =>
                i.brittle ||
                shallow.has(f) ||
                (i.component_type !== "AGENT" && ledgerData[f] && ledgerData[f].status !== "HEALED")
            )
            .map(([f]) => f);
    }

    triggerReflexes(healthSnapshot: any, personas: any[], allAlerts: any[], auditor: any): void {
        if (healthSnapshot.health_score < 40) {
            logger.warn("🚨 [Reflexo] Saúde Crítica Detectada. Suspendendo experimentação.");
            for (const p of personas) {
                if (typeof p.halt_experimentation === 'function') p.halt_experimentation();
            }
        }

        if (allAlerts.some(i => typeof i === 'object' && i.context === 'DependencyAuditor')) {
            if (typeof auditor?.sync_submodule === 'function') auditor.sync_submodule();
        }
    }
}
