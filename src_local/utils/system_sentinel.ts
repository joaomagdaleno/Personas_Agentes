import * as os from "node:os";
import winston from "winston";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { existsSync } from "node:fs";

const logger = winston.child({ module: "SystemSentinel" });
const GO_SENTINEL_PATH = "./src_native/go-sentinel.exe";

/**
 * Sentinela do Sistema PhD (Bun/Windows).
 * Analisa a performance global do hardware e sugere otimizações.
 */
export class SystemSentinel {
    private isAdmin: boolean = false;
    private healthCache: { data: any, timestamp: number } | null = null;
    private processCache: { data: any[], timestamp: number } | null = null;
    private readonly CACHE_TTL = 30000; // 30 segundos

    constructor() {
        this.isAdmin = this.checkAdmin();
    }

    private checkAdmin(): boolean {
        try {
            // No Windows, fs.accessSync de um diretório protegido falha se não for admin
            execSync("net session", { stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Coleta métricas básicas de hardware. 
     * Prioriza o binário Go para performance e precisão.
     */
    getSystemHealth() {
        if (this.healthCache && Date.now() - this.healthCache.timestamp < this.CACHE_TTL) {
            return this.healthCache.data;
        }

        if (existsSync(GO_SENTINEL_PATH)) {
            try {
                const output = execSync(GO_SENTINEL_PATH, { encoding: "utf8" });
                const data = JSON.parse(output);
                this.healthCache = { data, timestamp: Date.now() };
                return data;
            } catch (e) {
                logger.warn("⚠️ Falha ao executar Go Sentinel, fazendo fallback para Node.js");
            }
        }

        // Fallback Legado (Node.js + Tasklist)
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memUsage = ((totalMem - freeMem) / totalMem) * 100;

        const health = {
            cpu_usage: this.getAverageCpuUsageFallback(),
            memory_usage: memUsage.toFixed(2),
            memory_free_gb: (freeMem / (1024 ** 3)).toFixed(2),
            is_admin: this.isAdmin,
            platform: os.platform(),
            arch: os.arch(),
            uptime_hours: (os.uptime() / 3600).toFixed(2),
            heavy_processes: this.getHeavyProcessesFallback()
        };

        this.healthCache = { data: health, timestamp: Date.now() };
        return health;
    }

    private getAverageCpuUsageFallback(): number {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += (cpu.times as any)[type];
            }
            totalIdle += cpu.times.idle;
        }

        return 100 - (100 * totalIdle / totalTick);
    }

    private getHeavyProcessesFallback(): any[] {
        try {
            const output = execSync('tasklist /V /FO CSV', { encoding: 'utf8' });
            const lines = output.split('\n').slice(1);
            const heavy = [];

            for (const line of lines) {
                const parts = line.split('","').map(p => p.replace(/"/g, ''));
                if (parts.length < 5) continue;

                const memStr = (parts[4] || "").replace(/[^\d]/g, '');
                const memKb = parseInt(memStr || "0");

                if (memKb > 200000) {
                    heavy.push({
                        name: parts[0] || "Unknown",
                        pid: parseInt(parts[1] || "0") || 0,
                        mem_mb: (memKb / 1024).toFixed(2)
                    });
                }
            }
            return heavy.sort((a, b) => parseFloat(b.mem_mb) - parseFloat(a.mem_mb));
        } catch (e) {
            return [];
        }
    }

    /**
     * @deprecated Use getSystemHealth().heavy_processes
     */
    getHeavyProcesses(): any[] {
        const health = this.getSystemHealth();
        return health.heavy_processes || [];
    }

    suggestOptimizations(): string[] {
        const health = this.getSystemHealth();
        const suggestions: string[] = [];

        if (parseFloat(health.memory_usage) > 85) {
            suggestions.push("⚠️ RAM crítica (>85%). Considere limpar caches de navegadores.");
        }

        if (health.cpu_usage > 70) {
            suggestions.push("⚠️ Alta carga de CPU detectada. Verifique processos em background.");
        }

        if (!this.isAdmin) {
            suggestions.push("🛡️ Executar como ADMIN permitiria otimizações mais profundas no sistema.");
        }

        return suggestions;
    }

    /**
     * ⚖️ Governador de Recursos: Define prioridade e gerencia carga.
     */
    enforceGovernance() {
        try {
            // Define prioridade baixa para não travar o sistema do usuário
            os.setPriority(process.pid, os.constants.priority.PRIORITY_LOW);
            logger.info("⚖️ [Governor] Prioridade de processo ajustada para 'LOW' (Background).");
        } catch (e) {
            logger.warn(`⚠️ Falha ao ajustar prioridade: ${e}`);
        }
    }

    /**
     * Verifica se o sistema está sob carga pesada.
     */
    shouldThrottle(cpuLimit: number = 85, memLimit: number = 95): boolean {
        const health = this.getSystemHealth();
        const cpu = parseFloat(health.cpu_usage.toString()); // getSystemHealth returns localized/fixed strings? No, getAverageCpuUsage returns number.
        // Wait, getSystemHealth returns object with fixed strings for mem/uptime but cpu is number.
        // Actually getAverageCpuUsage returns number.

        const mem = parseFloat(health.memory_usage);

        if (cpu > cpuLimit || mem > memLimit) {
            logger.warn(`🌡️ [Governor] Carga alta detectada (CPU: ${cpu.toFixed(1)}%, MEM: ${mem.toFixed(1)}%). Reduzindo IA.`);
            return true;
        }
        return false;
    }

    /**
     * Pausa a execução se o sistema estiver sobrecarregado.
     */
    async yieldIfHighLoad(cpuLimit: number = 85, memLimit: number = 95) {
        while (this.shouldThrottle(cpuLimit, memLimit)) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    /** Parity: analyze_and_kill_bloatware — Identifies heavy processes and suggests termination. */
    analyze_and_kill_bloatware(): { process: string, mem_mb: string, action: string }[] {
        const heavy = this.getHeavyProcesses();
        const KNOWN_BLOAT = ["SearchIndexer.exe", "MsMpEng.exe", "OneDrive.exe", "Teams.exe"];
        return heavy
            .filter((p: any) => KNOWN_BLOAT.some(b => p.name?.toLowerCase().includes(b.toLowerCase())))
            .map((p: any) => ({
                process: p.name,
                mem_mb: p.mem_mb,
                action: this.isAdmin ? "KILL_ELIGIBLE" : "REQUIRES_ADMIN"
            }));
    }
}
