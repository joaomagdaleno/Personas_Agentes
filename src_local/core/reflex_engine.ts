import winston from "winston";
import { Orchestrator } from "./orchestrator.ts";

const logger = winston.child({ module: "ReflexEngine" });

/**
 * Motor de Reflexos PhD.
 * Reage autonomamente a flutuações na saúde sistêmica.
 */
export class ReflexEngine {
    constructor(private orc: Orchestrator) { }

    /**
     * Analisa o snapshot de saúde e dispara reações se necessário.
     */
    triggerReflexes(snapshot: any, findings: any[]) {
        const score = snapshot.healthScore || snapshot.health_score || 0;

        logger.info(`🧠 [Reflex] Analisando saúde sistêmica: ${score}%`);

        if (score < 40) {
            this.activateEmergencyMode();
        }

        this.checkDependencyReflex(findings);
    }

    /**
     * Entra em modo de emergência: trava experimentações e foca em estabilidade.
     */
    private activateEmergencyMode() {
        logger.warn("🚨 [Reflex] MODO DE EMERGÊNCIA ATIVADO (Saúde < 40%)");

        for (const persona of this.orc.personas) {
            if ('haltExperimentation' in persona && typeof persona.haltExperimentation === 'function') {
                persona.haltExperimentation();
            }
        }
    }

    /**
     * Verifica se há falhas em submodulos/dependências que exigem resync.
     */
    private checkDependencyReflex(findings: any[]) {
        const hasDepIssue = findings.some(f => f.context === 'DependencyAuditor' || f.issue?.includes('submodule'));

        if (hasDepIssue) {
            logger.info("📦 [Reflex] Detectada falha de dependência. Agendando resync de submodulos...");
            // TODO: Integrar com futuro DependencyAuditor
        }
    }
}

/** Parity: ReflexEnginePhd — Legacy alias for ReflexEngine. */
export class ReflexEnginePhd extends ReflexEngine {
    public trigger(): void { }
}
