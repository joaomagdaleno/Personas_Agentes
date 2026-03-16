import winston from "winston";
import { ScoreCalculator } from "./score_calculator";
import { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { ProjectContext, SystemMetrics, IAgent, QAData, SystemHealth360, GenericFinding } from "../../core/types.ts";
import { StabilityLedger } from "../../utils/stability_ledger.ts";

const logger = winston.child({ module: "HealthSynthesizer" });

/**
 * 🩺 HealthSynthesizer PhD (gRPC Proxy Edition).
 * Sintetiza a saúde global do sistema usando o ScoreCalculator proxied.
 */
export class HealthSynthesizer {
    private calculator: ScoreCalculator;

    constructor(hubManager?: HubManagerGRPC) {
        this.calculator = new ScoreCalculator(hubManager);
    }

    /**
     * Síntese 360 do sistema.
     */
    async synthesize360(context: ProjectContext, _metrics: SystemMetrics, _personas: IAgent[], _ledger: any, qaData: QAData): Promise<SystemHealth360> {
        logger.info("🩺 [Synthesizer] Sintetizando visão 360 do sistema via Hub Proxy...");

        const allAlerts = context.alerts || [];
        const mapData = context.map || {};

        // Calculate score asynchronously via gRPC
        const { score, breakdown } = await this.calculator.calculateFinalScore(mapData, allAlerts, qaData, context.cognitive);

        const { ScoringMetricsEngine } = await import("./scoring_metrics_engine");
        const metricsEngine = new ScoringMetricsEngine();
        const vitals = metricsEngine.getVitals(mapData);

        // 🌪️ Enriquecendo Mapa de Entropia com Métricas de Auditoria
        const enrichedMap = { ...mapData };
        if (qaData?.depth_audit?.metrics) {
            for (const metric of qaData.depth_audit.metrics) {
                const pathKey = metric.path;
                if (enrichedMap[pathKey]) {
                    enrichedMap[pathKey].ts_depth = metric.tsDepth;
                }
            }
        }

        // 🧬 Parity Counter Logic (Native Sovereignty v8.0)
        const { ParityAnalyst } = await import("../analysis/parity_analyst");
        const parityRoot = context.projectRoot ? `${context.projectRoot}/src_local/agents` : "src_local/agents";
        const analyst = new ParityAnalyst(parityRoot);
        const nativeReport = await analyst.analyzeAtomicParity();

        const parityStats = {
            total_atoms: nativeReport.totalAgents,
            shallow: 0,
            gaps: nativeReport.divergentCount,
            evolution: 0,
            deep: nativeReport.symmetricCount,
            native_sync: nativeReport.overallParity,
            raw_report: analyst.formatMarkdownReport(nativeReport)
        };

        // 🚩 Exposicão de gaps como achados reais (Não silenciar)
        if (nativeReport.divergentCount > 0) {
            for (const res of nativeReport.results.filter(r => r.status === "DIVERGENT")) {
                allAlerts.push({
                    file: res.agent,
                    severity: "CRITICAL",
                    issue: `Gap de Paridade Atômica: O agente em '${res.stack}' divergiu da referência TypeScript.`,
                    agent: "ParityAnalyst",
                    role: "PhD in Atomic Symmetry",
                    emoji: "⚖️",
                    stack: res.stack,
                    impact: "Quebra de fidelidade sistêmica entre stacks.",
                    evidence: `${res.deltas.length} discrepâncias detectadas: ${res.deltas.map(d => d.dimension).join(", ")}`
                });
            }
        }

        return {
            health_score: score,
            health_breakdown: breakdown,
            dark_matter: vitals.dark_matter,
            brittle_points: vitals.brittle_points,
            entropy_map: enrichedMap,
            confidence_matrix: qaData?.matrix || {},
            objective: (context.identity as any)?.core_mission || "Manutenção de Integridade",
            parity_stats: parityStats,
            predictor_metrics: context.predictor_metrics || { score: 0, status: "Unknown", label: "⚪ Estado Neural Indefinido" },
            timestamp: new Date().toISOString(),
            status: score > 80 ? "HEALTHY" : (score > 50 ? "WARNING" : "CRITICAL")
        };
    }
}
