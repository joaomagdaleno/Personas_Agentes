import winston from "winston";
import type { HealthScore } from "./policy_definitions.ts";;

// Create a local logger since we can't import the global one easily without circular deps
const logger = winston.child({ module: "ReflexEngine(Gov)" });

/**
 * ⚡ Reflex Engine (Sovereign).
 * Automatic systemic responses to health threats.
 */
export class ReflexEngine {
    /**
     * Gatilho de Reflexos Sistêmicos.
     */
    public triggerReflexes(health: HealthScore, personas: any[]): void {
        logger.info(`⚡ [PhD] Estado Sistêmico: ${health.total}% - Analisando Reflexos...`);

        if (health.total < 20) {
            this.executeEmergencyAction("HALT", personas);
            return;
        }

        if (health.stability < 20) {
            logger.error("🛑 [PhD] ALERTA DE INSTABILIDADE: Cobertura de testes crítica!");
            this.executeEmergencyAction("STABILIZE", personas);
        }

        if (health.security < 10) {
            logger.error("🛡️ [PhD] ALERTA DE SEGURANÇA: Vulnerabilidades críticas detectadas!");
            this.executeEmergencyAction("PROTECT", personas);
        }

        const voyager = personas.find((p: any) => p.name === "Voyager");
        if (health.total < 80 && voyager && voyager.performActiveHealing) {
            voyager.performActiveHealing(["SYSTEM_FRAGILITY_RECOVERY"]);
        }

        if (health.purity < 10) {
            logger.warn("扫 [PhD] Solicitando refatoração emergencial por alta complexidade.");
        }
    }

    private executeEmergencyAction(action: string, personas: any[]): void {
        switch (action) {
            case "STABILIZE":
                logger.info("🧪 [PhD] Iniciando protocolo de estabilização...");
                const testify = personas.find((p: any) => p.name === "Testify");
                if (testify) testify.performAudit();
                break;
            case "PROTECT":
                logger.warn("🛡️ [PhD] Ativando escudos de segurança...");
                const sentinel = personas.find((p: any) => p.name === "Sentinel");
                if (sentinel) sentinel.performAudit();
                break;
            case "HALT":
                logger.error("🚨 [PhD] PARADA DE EMERGÊNCIA: Integridade sistêmica comprometida!");
                break;
            case "RESTORE":
                logger.error("🚨 [PhD] Iniciando restauração soberana!");
                break;
            default:
                logger.warn(`❓ [PhD] Ação de emergência desconhecida: ${action}`);
        }
    }
}
