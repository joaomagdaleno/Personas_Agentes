import winston from "winston";
import { eventBus } from "./event_bus.ts";
import type { GenericFinding } from "./types.ts";

const logger = winston.child({ module: "ReflexEngine" });

/**
 * Motor de Reflexos PhD.
 * Reage autonomamente a flutuações na saúde sistêmica.
 * Usa o EventBus para comunicação — sem referência direta ao Orchestrator.
 */
export class ReflexEngine {
    constructor() {
        this.registerListeners();
    }

    private registerListeners(): void {
        eventBus.on("system:health-check", ({ score, findings }: { score: number, findings: GenericFinding[] }) => {
            this.triggerReflexes({ health_score: score }, findings);
        });
    }

    triggerReflexes(snapshot: { health_score: number }, findings: GenericFinding[]) {
        const score = snapshot.health_score || 0;

        logger.info(`🧠 [Reflex] Analisando saúde sistêmica: ${score}%`);

        if (score < 40) {
            this.activateEmergencyMode();
        }

        this.checkDependencyReflex(findings);
    }

    /**
     * Entra em modo de emergência: emite evento para travar experimentações.
     */
    private activateEmergencyMode() {
        logger.warn("🚨 [Reflex] MODO DE EMERGÊNCIA ATIVADO (Saúde < 40%)");
        eventBus.emit("system:halt-experimentation");
    }

    /**
     * Verifica se há falhas em submodulos/dependências que exigem resync.
     */
    private checkDependencyReflex(findings: GenericFinding[]) {
        const hasDepIssue = findings.some(f => 
            f.context === 'DependencyAuditor' || 
            (f.issue && (f.issue.toLowerCase().includes('submodule') || f.issue.toLowerCase().includes('dependency')))
        );

        if (hasDepIssue) {
            logger.info("📦 [Reflex] Detectada falha de dependência. Agendando resync de submodulos...");
            // Emite evento para que o Orchestrator ou Hub nativo processe o resync
            eventBus.emit("cache:updated"); // Placeholder para forçar atualização de contexto
        }
    }
}
