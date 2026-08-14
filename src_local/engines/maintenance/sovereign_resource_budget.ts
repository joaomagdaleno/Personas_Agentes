import * as os from "node:os";
import winston from "winston";
import { eventBus } from "../../core/event_bus.ts";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} - ResourceBudget - ${level.toUpperCase()} - ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

export type AdaptiveMode = "Ultraleve" | "Balanceado" | "Turbo";

export interface TelemetrySnapshot {
    timestamp: number;
    ramTotalGB: number;
    ramFreeGB: number;
    ramUsagePercent: number;
    cpuUsagePercent: number;
    cpuCount: number;
    estimatedTempC: number;
    isOnBattery: boolean;
    resourceScore: number;
    mode: AdaptiveMode;
}

export interface AdaptiveConfig {
    mode: AdaptiveMode;
    resourceScore: number;
    maxConcurrentWorkers: number;
    maxWasmMicroAgents: number;
    fileWatchIntervalMs: number;
    aiStrategy: "CloudOnly" | "CloudOrWarmPurge" | "LocalOrCloudWithCache";
}

export class SovereignResourceBudget {
    private static instance: SovereignResourceBudget;

    private intervalTimer: ReturnType<typeof setInterval> | null = null;
    private intervalMs: number = 3000;
    private previousCpuTimes: { idle: number; total: number } | null = null;
    private latestSnapshot: TelemetrySnapshot;

    constructor() {
        this.latestSnapshot = this.sampleTelemetry();
    }

    public static getInstance(): SovereignResourceBudget {
        if (!SovereignResourceBudget.instance) {
            SovereignResourceBudget.instance = new SovereignResourceBudget();
        }
        return SovereignResourceBudget.instance;
    }

    /**
     * Starts the continuous 3-second adaptive telemetry loop.
     */
    public startLoop(intervalMs: number = 3000): void {
        this.intervalMs = intervalMs;
        if (this.intervalTimer) return;

        logger.info(`🎛️ [ResourceBudget] Loop de telemetria contínua iniciado (${this.intervalMs}ms).`);
        this.intervalTimer = setInterval(() => {
            const previousMode = this.latestSnapshot.mode;
            this.latestSnapshot = this.sampleTelemetry();

            if (previousMode !== this.latestSnapshot.mode) {
                logger.info(`🔄 [ResourceBudget] Modo alterado: ${previousMode} ➔ ${this.latestSnapshot.mode} (Score: ${this.latestSnapshot.resourceScore})`);
                try {
                    eventBus.emit("resource:mode_changed", {
                        mode: this.latestSnapshot.mode,
                        score: this.latestSnapshot.resourceScore,
                        config: this.getAdaptiveConfig()
                    });
                } catch {
                    // Ignore event bus errors
                }
            }
        }, this.intervalMs);

        // Do not block process exit
        if (this.intervalTimer && typeof this.intervalTimer === "object" && "unref" in this.intervalTimer) {
            this.intervalTimer.unref();
        }
    }

    /**
     * Stops the telemetry loop.
     */
    public stopLoop(): void {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
            logger.info("🎛️ [ResourceBudget] Loop de telemetria pausado.");
        }
    }

    /**
     * Collects an instantaneous snapshot of system metrics and computes the Sovereign Score (0-100).
     */
    public sampleTelemetry(): TelemetrySnapshot {
        const totalGB = os.totalmem() / (1024 ** 3);
        const freeGB = os.freemem() / (1024 ** 3);
        const ramUsagePercent = Math.min(100, Math.max(0, Math.round(((totalGB - freeGB) / totalGB) * 100)));

        const cpuUsagePercent = this.calculateCpuUsage();
        const cpuCount = os.cpus().length || 1;

        // Estimated temperature: base 40C + CPU load * 0.4 + RAM load * 0.1
        const estimatedTempC = Math.round(40 + (cpuUsagePercent * 0.4) + (ramUsagePercent * 0.1));
        const isOnBattery = false; // Default to plugged-in unless battery power API is hooked

        const resourceScore = this.calculateResourceScore(ramUsagePercent, cpuUsagePercent, estimatedTempC, isOnBattery);
        const mode = this.determineMode(resourceScore);

        return {
            timestamp: Date.now(),
            ramTotalGB: Math.round(totalGB * 10) / 10,
            ramFreeGB: Math.round(freeGB * 10) / 10,
            ramUsagePercent,
            cpuUsagePercent,
            cpuCount,
            estimatedTempC,
            isOnBattery,
            resourceScore,
            mode
        };
    }

    /**
     * Calculates Sovereign Capacity Score (0 to 100).
     * Score calculation considers:
     * - RAM Headroom (40% weight)
     * - CPU Headroom (40% weight)
     * - Thermal State (15% weight)
     * - Power/Battery State (5% weight)
     */
    public calculateResourceScore(
        ramUsage: number,
        cpuUsage: number,
        tempC: number,
        onBattery: boolean
    ): number {
        const ramScore = Math.max(0, 100 - ramUsage);
        const cpuScore = Math.max(0, 100 - cpuUsage);

        // Thermal penalty: Above 75C reduces score progressively
        let thermalScore = 100;
        if (tempC > 75) {
            thermalScore = Math.max(0, 100 - ((tempC - 75) * 4));
        }

        const batteryScore = onBattery ? 50 : 100;

        const totalScore = Math.round(
            (ramScore * 0.40) +
            (cpuScore * 0.40) +
            (thermalScore * 0.15) +
            (batteryScore * 0.05)
        );

        return Math.min(100, Math.max(0, totalScore));
    }

    /**
     * Maps Score (0-100) to Adaptive Mode.
     */
    public determineMode(score: number): AdaptiveMode {
        if (score < 30) return "Ultraleve";
        if (score <= 70) return "Balanceado";
        return "Turbo";
    }

    /**
     * Returns actionable system configuration based on current Sovereign Score.
     */
    public getAdaptiveConfig(): AdaptiveConfig {
        const snapshot = this.getLatestSnapshot();
        const cores = snapshot.cpuCount;

        switch (snapshot.mode) {
            case "Ultraleve":
                return {
                    mode: "Ultraleve",
                    resourceScore: snapshot.resourceScore,
                    maxConcurrentWorkers: 1,
                    maxWasmMicroAgents: 1,
                    fileWatchIntervalMs: 10000,
                    aiStrategy: "CloudOnly"
                };

            case "Balanceado":
                return {
                    mode: "Balanceado",
                    resourceScore: snapshot.resourceScore,
                    maxConcurrentWorkers: Math.max(2, cores),
                    maxWasmMicroAgents: 3,
                    fileWatchIntervalMs: 3000,
                    aiStrategy: "CloudOrWarmPurge"
                };

            case "Turbo":
                return {
                    mode: "Turbo",
                    resourceScore: snapshot.resourceScore,
                    maxConcurrentWorkers: Math.max(4, cores * 2),
                    maxWasmMicroAgents: 8,
                    fileWatchIntervalMs: 1000,
                    aiStrategy: "LocalOrCloudWithCache"
                };
        }
    }

    public getLatestSnapshot(): TelemetrySnapshot {
        return this.latestSnapshot;
    }

    /**
     * Measures CPU time differential between samples to obtain instant % CPU usage.
     */
    private calculateCpuUsage(): number {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += (cpu.times as any)[type];
            }
            totalIdle += cpu.times.idle;
        }

        if (!this.previousCpuTimes) {
            this.previousCpuTimes = { idle: totalIdle, total: totalTick };
            const load = os.loadavg();
            return load && load[0] ? Math.min(100, Math.round((load[0] / cpus.length) * 100)) : 10;
        }

        const idleDiff = totalIdle - this.previousCpuTimes.idle;
        const totalDiff = totalTick - this.previousCpuTimes.total;
        this.previousCpuTimes = { idle: totalIdle, total: totalTick };

        if (totalDiff <= 0) return 0;
        const usage = 100 - Math.round((idleDiff / totalDiff) * 100);
        return Math.min(100, Math.max(0, usage));
    }
}
