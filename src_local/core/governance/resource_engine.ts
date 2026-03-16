import os from "node:os";

/**
 * 🔋 Resource Engine (Sovereign).
 * Manages hardware profiling and dynamic throttling based on real-time OS metrics.
 */
export class ResourceEngine {
    /**
     * Retorna o perfil estático de recursos baseado na capacidade total de hardware informada.
     */
    public getResourceProfile(cores: number, ramGb: number): { profile: string, parallelism: number, throttle: boolean } {
        if (ramGb >= 64) return { profile: "ELITE_MODE", parallelism: cores * 8, throttle: false };
        if (ramGb >= 32) return { profile: "GOD_MODE", parallelism: cores * 4, throttle: false };
        if (ramGb >= 16) return { profile: "SOVEREIGN", parallelism: cores * 2, throttle: false };
        if (ramGb >= 8) return { profile: "STANDARD", parallelism: cores, throttle: true };
        return { profile: "CONSTRAINED", parallelism: Math.max(1, Math.floor(cores / 2)), throttle: true };
    }

    /**
     * Coleta as métricas reais do Sistema Operacional neste instante.
     */
    public getCurrentLoad(): { freeMemoryGb: number; totalMemoryGb: number; loadAvg: number[]; cpuCores: number } {
        const freeMemoryGb = os.freemem() / (1024 ** 3);
        const totalMemoryGb = os.totalmem() / (1024 ** 3);
        const loadAvg = os.loadavg();
        const cpuCores = os.cpus().length;

        return { freeMemoryGb, totalMemoryGb, loadAvg, cpuCores };
    }

    /**
     * Determina se o sistema do host está em estado crítico (sobrecarga de RAM ou CPU).
     */
    public isSystemOverloaded(): { overloaded: boolean; reason?: string } {
        const metrics = this.getCurrentLoad();
        
        // Regra 1: Menos de 1.5GB de RAM livre
        if (metrics.freeMemoryGb < 1.5) {
            return { overloaded: true, reason: `Critically low memory: ${metrics.freeMemoryGb.toFixed(2)} GB free.` };
        }

        // Regra 2: Carga média da CPU nos últimos 1 minuto supera 90% dos cores disponíveis
        // (Apenas disponível em sistemas Unix-like, no Windows loadavg retorna [0,0,0])
        if (metrics.loadAvg[0] > (metrics.cpuCores * 0.90) && metrics.loadAvg[0] > 0) {
            return { overloaded: true, reason: `High CPU Load average: ${metrics.loadAvg[0].toFixed(2)}.` };
        }

        return { overloaded: false };
    }

    /**
     * Retorna um degrau de concorrência dinâmico. Se o sistema estiver sobrecarregado, recua.
     */
    public getDynamicConcurrency(baseConcurrency: number): number {
        const status = this.isSystemOverloaded();
        if (status.overloaded) {
            // Em estado crítico, cai para o mínimo operacional (1 ou 2 threads).
            return Math.max(1, Math.floor(baseConcurrency * 0.25)); 
        }
        
        // Se a memória livre estiver moderada (ex: entre 1.5GB e 3GB), aplica throttle leve (50%).
        const metrics = this.getCurrentLoad();
        if (metrics.freeMemoryGb < 3.0) {
            return Math.max(1, Math.floor(baseConcurrency * 0.5));
        }

        return baseConcurrency; // Todo gás
    }
}
