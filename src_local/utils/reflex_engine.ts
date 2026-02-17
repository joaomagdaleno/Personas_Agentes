import winston from "winston";
import { HealthSynthesizer } from "../agents/Support/Diagnostics/health_synthesizer.ts";

const logger = winston.child({ module: "ReflexEngine" });

/**
 * ⚡ Motor de Reflexos PhD (High-Fidelity TypeScript Version).
 * Orquestra reações autônomas a eventos críticos do sistema.
 * 
 * Melhorias sobre a versão legacy:
 * 1. Execução verdadeiramente assíncrona (Promise based).
 * 2. Filtragem de alvos de produção ultra-precisa.
 * 3. Logging semântico integrado ao Winston.
 */
export class ReflexEngine {
    /**
     * Dispara gatilhos de reação baseados no estado de saúde sistêmica.
     */
    public static async trigger(
        health: any,
        personas: any[],
        jobQueue: any[] = [],
        auditor: any = null
    ): Promise<void> {
        logger.info("⚡ [Reflex] Analisando sinais vitais para disparar reflexos...");

        // 1. Cura Ativa (Voyager) - Prioridade Máxima para Produção
        const productionBlindSpots = (health.blind_spots || []).filter((f: string) => {
            const fileInfo = (health.map || {})[f];
            return fileInfo && fileInfo.domain === "PRODUCTION";
        });

        if (productionBlindSpots.length > 0) {
            const voyager = personas.find(p => p.name === "Voyager");
            if (voyager && typeof voyager.performActiveHealing === "function") {
                logger.warn(`🚀 [Reflex] Voyager disparando cura ativa para ${productionBlindSpots.length} alvos críticos.`);
                await voyager.performActiveHealing(productionBlindSpots);
            }
        }

        // 2. Sincronia de Dependências (Gatilho reativo)
        const hasAuditorTask = jobQueue.some(job =>
            typeof job === "object" && job !== null && job.context === "DependencyAuditor"
        );

        if (hasAuditorTask && auditor && typeof auditor.syncSubmodule === "function") {
            logger.info("🔗 [Reflex] Sincronizando subódulos de dependências detectados na fila.");
            await auditor.syncSubmodule();
        }

        // 3. Notificações de Fragilidade (Consciência Ativa)
        const brittlePoints = health.brittle_points || [];
        if (brittlePoints.length > 0) {
            logger.warn(`⚒️ [Reflex] Sistema detectou ${brittlePoints.length} pontos de fragilidade estrutural!`);
        }

        logger.info("⚡ [Reflex] Ciclo de reflexos concluído.");
    }
}

/** Parity: ReflexEnginePhd — Legacy alias for ReflexEngine. */
export class ReflexEnginePhd extends ReflexEngine { }
