/**
 * ⚖️ Governador de Recursos Soberano.
 * Garante que a IA seja uma cidadã bem-educada no sistema operacional.
 * Soberania: CORE-UTILITY.
 */
import winston from "winston";
import { cpus, totalmem, freemem } from "node:os";

const logger = winston.child({ module: "ResourceGovernor" });

export interface PerformanceProfile {
    profile: "Soberano" | "Standard" | "Lite";
    maxWorkers: number;
    aiContext: number;
    aiThreads: number;
}

export interface SystemPressure {
    cpuCount: number;
    ramTotalGB: number;
    ramFreeGB: number;
    ramUsagePercent: number;
    isCritical: boolean;
}

/**
 * ⚖️ ResourceGovernor — Governador de recursos do sistema.
 *
 * Responsável por:
 * 1. Definir perfil de performance baseado no hardware
 * 2. Monitorar pressão do sistema
 * 3. Throttle inteligente para evitar sobrecarregar o PC
 */
export class ResourceGovernor {
    private cpuLimit: number;
    private memLimit: number;

    constructor(cpuLimit: number = 85, memLimit: number = 95) {
        this.cpuLimit = cpuLimit;
        this.memLimit = memLimit;
        logger.info("⚖️ [Governor] ResourceGovernor inicializado.");
    }

    /**
     * 📊 Define o perfil de performance baseado no hardware real.
     * Lite: < 8GB RAM ou < 4 Cores
     * Standard: 8GB-16GB RAM
     * Soberano: > 16GB RAM e 8+ Cores
     */
    static getPerformanceProfile(): PerformanceProfile {
        const cores = cpus().length;
        const ramGB = totalmem() / (1024 ** 3);

        if (ramGB > 16 && cores >= 8) {
            return {
                profile: "Soberano",
                maxWorkers: cores * 2,
                aiContext: 4096,
                aiThreads: Math.max(4, Math.floor(cores / 2)),
            };
        } else if (ramGB >= 8) {
            return {
                profile: "Standard",
                maxWorkers: cores,
                aiContext: 2048,
                aiThreads: Math.max(2, Math.floor(cores / 4)),
            };
        } else {
            return {
                profile: "Lite",
                maxWorkers: Math.max(2, Math.floor(cores / 2)),
                aiContext: 1024,
                aiThreads: 2,
            };
        }
    }

    /**
     * 🌐 Retorna métricas de pressão do sistema em tempo real.
     */
    static getCurrentPressure(): SystemPressure {
        const cores = cpus().length;
        const totalGB = totalmem() / (1024 ** 3);
        const freeGB = freemem() / (1024 ** 3);
        const usagePercent = Math.round(((totalGB - freeGB) / totalGB) * 100);

        return {
            cpuCount: cores,
            ramTotalGB: Math.round(totalGB * 10) / 10,
            ramFreeGB: Math.round(freeGB * 10) / 10,
            ramUsagePercent: usagePercent,
            isCritical: usagePercent > 90,
        };
    }

    /**
     * 🌡️ Verifica se o sistema está sob carga pesada.
     */
    shouldThrottle(): boolean {
        const pressure = ResourceGovernor.getCurrentPressure();
        if (pressure.ramUsagePercent > this.memLimit) {
            logger.warn(`🌡️ [Governor] Carga alta (RAM: ${pressure.ramUsagePercent}%). Reduzindo.`);
            return true;
        }
        return false;
    }

    /**
     * ⏳ Pausa se o sistema estiver sobrecarregado (com timeout).
     */
    async waitIfNeeded(maxWaitMs: number = 30_000): Promise<void> {
        const start = Date.now();
        while (this.shouldThrottle()) {
            if (Date.now() - start > maxWaitMs) {
                logger.warn("⚖️ [Governor] Timeout de throttle atingido. Continuando.");
                break;
            }
            await Bun.sleep(2000);
        }
    }

    /**
     * 📋 Retorna um resumo formatado do perfil do sistema.
     */
    static getSummary(): string {
        const profile = this.getPerformanceProfile();
        const pressure = this.getCurrentPressure();
        return [
            `Profile: ${profile.profile}`,
            `Workers: ${profile.maxWorkers}`,
            `RAM: ${pressure.ramFreeGB}GB free / ${pressure.ramTotalGB}GB total (${pressure.ramUsagePercent}%)`,
            `CPUs: ${pressure.cpuCount}`,
            `Status: ${pressure.isCritical ? "🔴 CRITICAL" : "🟢 OK"}`,
        ].join(" | ");
    }

}
