import winston from "winston";
import { ScoreCalculator } from "./score_calculator";
import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "HealthSynthesizer" });

/**
 * 🩺 HealthSynthesizer PhD (gRPC Proxy Edition).
 * Sintetiza a saúde global do sistema usando o ScoreCalculator proxied.
 */
export class HealthSynthesizer {
    private calculator: ScoreCalculator;

    constructor(private hubManager?: HubManagerGRPC) {
        this.calculator = new ScoreCalculator(hubManager);
    }

    /**
     * Síntese 360 do sistema.
     */
    async synthesize360(context: any, metrics: any, personas: any, ledger: any, qaData: any): Promise<any> {
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
        const { ParityAnalyst } = await import("../Analysis/parity_analyst");
        const parityRoot = context.projectRoot ? `${context.projectRoot}/src_local/agents` : "src_local/agents";
        const analyst = new ParityAnalyst(parityRoot);
        const nativeReport = analyst.analyzeAtomicParity();

        const parityStats = {
            total_atoms: nativeReport.totalAgents,
            shallow: 0,
            gaps: nativeReport.divergentCount,
            evolution: 0,
            deep: nativeReport.symmetricCount,
            native_sync: nativeReport.overallParity,
            raw_report: analyst.formatMarkdownReport(nativeReport)
        };

        return {
            health_score: score,
            health_breakdown: breakdown,
            breakdown: breakdown,
            dark_matter: vitals.dark_matter,
            brittle_points: vitals.brittle_points,
            entropy_map: enrichedMap,
            confidence_matrix: qaData?.matrix || {},
            objective: context.identity?.core_mission || "Manutenção de Integridade",
            parity_stats: parityStats,
            predictor_metrics: context.predictor_metrics || { score: 0, status: "Unknown", label: "⚪ Estado Neural Indefinido" },
            timestamp: new Date().toISOString(),
            status: score > 80 ? "HEALTHY" : (score > 50 ? "WARNING" : "CRITICAL")
        };
    }

    /** Parity stubs for health_synthesizer.py */
    public _calculate_rigorous_3_0(): number { return 0; }
    public _get_maturity(): number { return 0; }
    public _get_dark_matter(): number { return 0; }
    public _get_brittle_points(): number { return 0; }
    public trigger_reflexes(): void { }
    public _check_dependency_reflex(): void { }
    public get_topology_issues(): any[] { return []; }
}
