import winston from "winston";
import { ScoreCalculator } from "./score_calculator";

const logger = winston.child({ module: "HealthSynthesizer" });

/**
 * 🩺 HealthSynthesizer PhD (Bridge Version).
 * Sintetiza a saúde global do sistema usando o ScoreCalculator.
 */
export class HealthSynthesizer {
    private calculator: ScoreCalculator;

    constructor() {
        this.calculator = new ScoreCalculator();
    }

    /**
     * Síntese 360 do sistema.
     */
    async synthesize360(context: any, metrics: any, personas: any, ledger: any, qaData: any): Promise<any> {
        logger.info("🩺 [Synthesizer] Sintetizando visão 360 do sistema...");

        // Debug what's available in context and qaData
        logger.debug("Context structure:", Object.keys(context));
        logger.debug("QA Data structure:", Object.keys(qaData || {}));

        const allAlerts = context.alerts || [];
        const mapData = context.map || {};

        logger.debug(`Alerts found: ${allAlerts.length}`);
        logger.debug(`Map data entries: ${Object.keys(mapData).length}`);

        // Calculate score
        const { score, breakdown } = this.calculator.calculateFinalScore(mapData, allAlerts, qaData);

        logger.debug(`Calculated score: ${score}`);
        logger.debug("Score breakdown:", breakdown);

        // Verify calculations manually
        const { ScoringMetricsEngine } = await import("./scoring_metrics_engine");
        const metricsEngine = new ScoringMetricsEngine();
        const [stability, ,] = metricsEngine.calcStability(mapData);
        const [purity,] = metricsEngine.calcPurity(mapData, Object.keys(mapData).length);
        const [observability, ,] = metricsEngine.calcObservability(mapData);
        const [security,] = metricsEngine.calcSecurity(allAlerts);
        const [excellence,] = metricsEngine.calcExcellence(mapData, Object.keys(mapData).length);

        logger.debug(`Manual calculation breakdown:`);
        logger.debug(`- Stability: ${stability}`);
        logger.debug(`- Purity: ${purity}`);
        logger.debug(`- Observability: ${observability}`);
        logger.debug(`- Security: ${security}`);
        logger.debug(`- Excellence: ${excellence}`);

        const vitals = metricsEngine.getVitals(mapData);

        // 🌪️ Enriquecendo Mapa de Entropia com Alta Resolução (Depth Intelligence)
        const enrichedMap = { ...mapData };
        if (qaData?.depth_audit?.metrics) {
            for (const metric of qaData.depth_audit.metrics) {
                const pathKey = metric.path;
                if (enrichedMap[pathKey]) {
                    enrichedMap[pathKey].complexity = metric.tsDepth;
                } else {
                    // Tenta encontrar por basename se o path absoluto/relativo divergir
                    const base = pathKey.split('/').pop();
                    for (const key of Object.keys(enrichedMap)) {
                        if (key.endsWith(base || "")) {
                            enrichedMap[key].complexity = metric.tsDepth;
                            break;
                        }
                    }
                }
            }
        }

        // 🧬 Parity Counter Logic (v7.6)
        const parityStats = {
            total_atoms: Object.keys(mapData).length,
            shallow: 0,
            gaps: 0,
            evolution: 0,
            deep: 0
        };

        for (const f of allAlerts) {
            if (f.type === "EVOLUTION") {
                parityStats.evolution++;
            } else if (f.type === "DISPARITY") {
                if (f.meta?.level === "SHALLOW") {
                    parityStats.shallow++;
                } else if (f.severity !== "INFO") {
                    parityStats.gaps++;
                }
            }
        }
        // Deep Parity = Total atoms minus those with active disparity issues
        // We assume one finding per file for simplicity in this visualization
        parityStats.deep = Math.max(0, parityStats.total_atoms - (parityStats.shallow + parityStats.gaps));

        return {
            health_score: score,
            health_breakdown: breakdown, // Alias para compatibilidade com ReportSectionsEngine
            breakdown: breakdown,
            dark_matter: vitals.dark_matter,
            brittle_points: vitals.brittle_points,
            entropy_map: enrichedMap,
            confidence_matrix: qaData?.matrix || {},
            objective: context.identity?.core_mission || "Manutenção de Integridade",
            parity_stats: parityStats,
            timestamp: new Date().toISOString(),
            status: score > 80 ? "HEALTHY" : (score > 50 ? "WARNING" : "CRITICAL")
        };
    }
}
