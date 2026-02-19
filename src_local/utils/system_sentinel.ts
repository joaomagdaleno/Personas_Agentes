import * as os from "node:os";
import winston from "winston";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { ResourceGovernor } from "./strategies/ResourceGovernor.ts";
import { MetricScanner } from "./strategies/MetricScanner.ts";
import { HealthCollector } from "./strategies/HealthCollector.ts";

const logger = winston.child({ module: "SystemSentinel" });
const GO_SENTINEL_PATH = "./src_native/go-sentinel.exe";

export class SystemSentinel {
    private isAdmin: boolean = false;
    private healthCache: { data: any, timestamp: number } | null = null;
    private readonly CACHE_TTL = 30000;

    constructor() { this.isAdmin = this.checkAdmin(); }

    private checkAdmin(): boolean {
        try { execSync("net session", { stdio: "ignore" }); return true; }
        catch { return false; }
    }

    getSystemHealth() {
        if (this.healthCache && Date.now() - this.healthCache.timestamp < this.CACHE_TTL) return this.healthCache.data;
        if (existsSync(GO_SENTINEL_PATH)) {
            try { const h = JSON.parse(execSync(GO_SENTINEL_PATH, { encoding: "utf8" })); this.healthCache = { data: h, timestamp: Date.now() }; return h; }
            catch (e) { logger.warn("⚠️ Go Sentinel Fallback."); }
        }
        const h = HealthCollector.collect(this.isAdmin); this.healthCache = { data: h, timestamp: Date.now() }; return h;
    }

    getHeavyProcesses(): any[] { return this.getSystemHealth().heavy_processes || []; }

    suggestOptimizations(): string[] {
        const h = this.getSystemHealth(), suggestions: string[] = [];
        if (parseFloat(h.memory_usage) > 85) suggestions.push("⚠️ RAM crítica (>85%).");
        if (h.cpu_usage > 70) suggestions.push("⚠️ Alta carga de CPU.");
        if (!this.isAdmin) suggestions.push("🛡️ Executar como ADMIN permitiria otimizações.");
        return suggestions;
    }

    enforceGovernance() { ResourceGovernor.enforce(process.pid); }
    shouldThrottle(cpuLimit: number = 85, memLimit: number = 95): boolean {
        return ResourceGovernor.shouldThrottle(this.getSystemHealth(), cpuLimit, memLimit);
    }
    async yieldIfHighLoad(cpuL: number = 85, memL: number = 95) {
        await ResourceGovernor.yield(() => this.shouldThrottle(cpuL, memL));
    }

    analyze_and_kill_bloatware(): { process: string, mem_mb: string, action: string }[] {
        const KNOWN_BLOAT = ["SearchIndexer.exe", "MsMpEng.exe", "OneDrive.exe", "Teams.exe"];
        return this.getHeavyProcesses()
            .filter((p: any) => KNOWN_BLOAT.some(b => p.name?.toLowerCase().includes(b.toLowerCase())))
            .map((p: any) => ({ process: p.name, mem_mb: p.mem_mb, action: this.isAdmin ? "KILL_ELIGIBLE" : "REQUIRES_ADMIN" }));
    }
}
