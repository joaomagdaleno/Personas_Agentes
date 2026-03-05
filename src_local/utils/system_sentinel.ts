import winston from "winston";
import { ResourceGovernor } from "./strategies/ResourceGovernor.ts";
import { HealthCollector } from "./strategies/HealthCollector.ts";

const logger = winston.child({ module: "SystemSentinel" });
const HUB_STATUS_URL = "http://localhost:8080/status";

export class SystemSentinel {
    private isAdmin: boolean = false;
    private healthCache: { data: any, timestamp: number } | null = null;
    private readonly CACHE_TTL = 3000; // Hub is fast, reduce TTL

    constructor() { this.isAdmin = this.checkAdmin(); }

    private checkAdmin(): boolean {
        // Simple check remains local
        return false; // Net session check omitted for simplicity in this refactor
    }

    async getSystemHealth() {
        if (this.healthCache && Date.now() - this.healthCache.timestamp < this.CACHE_TTL) return this.healthCache.data;

        try {
            const response = await fetch(HUB_STATUS_URL);
            if (response.ok) {
                const h = (await response.json()).metrics;
                this.healthCache = { data: h, timestamp: Date.now() };
                return h;
            }
        } catch (e) {
            logger.warn("⚠️ Hub Sentinel unavailable. Using local fallback.");
        }

        const h = HealthCollector.collect(this.isAdmin);
        this.healthCache = { data: h, timestamp: Date.now() };
        return h;
    }

    async getHeavyProcesses(): Promise<any[]> {
        const health = await this.getSystemHealth();
        return health.heavy_processes || [];
    }

    async suggestOptimizations(): Promise<string[]> {
        const h = await this.getSystemHealth(), suggestions: string[] = [];
        if (parseFloat(h.memory_usage) > 85) suggestions.push("⚠️ RAM crítica (>85%).");
        if (h.cpu_usage > 70) suggestions.push("⚠️ Alta carga de CPU.");
        if (!this.isAdmin) suggestions.push("🛡️ Executar como ADMIN permitiria otimizações.");
        return suggestions;
    }

    enforceGovernance() { ResourceGovernor.enforce(process.pid); }

    async shouldThrottle(cpuLimit: number = 85, memLimit: number = 95): Promise<boolean> {
        return ResourceGovernor.shouldThrottle(await this.getSystemHealth(), cpuLimit, memLimit);
    }

    async yieldIfHighLoad(cpuL: number = 85, memL: number = 95) {
        await ResourceGovernor.yield(async () => await this.shouldThrottle(cpuL, memL));
    }

    async analyze_and_kill_bloatware(): Promise<{ process: string, mem_mb: string, action: string }[]> {
        const KNOWN_BLOAT = ["SearchIndexer.exe", "MsMpEng.exe", "OneDrive.exe", "Teams.exe"];
        const procs = await this.getHeavyProcesses();
        return procs
            .filter((p: any) => KNOWN_BLOAT.some(b => p.name?.toLowerCase().includes(b.toLowerCase())))
            .map((p: any) => ({ process: p.name, mem_mb: p.mem_mb, action: this.isAdmin ? "KILL_ELIGIBLE" : "REQUIRES_ADMIN" }));
    }
}
