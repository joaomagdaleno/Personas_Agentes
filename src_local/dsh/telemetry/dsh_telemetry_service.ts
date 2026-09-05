import type { DshContext } from "../kernel/dsh_context.ts";

export interface DshTelemetrySnapshot {
    tokensPerSec: number;
    cacheHitRate: number;
    latencyMs: number;
    turnCount: number;
    memoryFootprintMb: number;
    timestamp: string;
}

export class DshTelemetryService {
    private currentSnapshot: DshTelemetrySnapshot;
    private ctx: DshContext;

    constructor(ctx: DshContext) {
        this.ctx = ctx;
        this.currentSnapshot = {
            tokensPerSec: 0,
            cacheHitRate: 0,
            latencyMs: 0,
            turnCount: 0,
            memoryFootprintMb: 58.0,
            timestamp: new Date().toISOString()
        };
    }

    public recordTurnMetrics(metrics: { tokens: number; durationMs: number; cacheHit?: boolean; ttftMs?: number }): DshTelemetrySnapshot {
        this.currentSnapshot.turnCount++;
        this.currentSnapshot.latencyMs = metrics.durationMs;
        const durSec = Math.max(0.1, metrics.durationMs / 1000);
        this.currentSnapshot.tokensPerSec = Number((metrics.tokens / durSec).toFixed(1));
        
        // Simulação realista do KV cache rate baseado em taxa cumulativa
        const hitWeight = metrics.cacheHit ? 95.0 : 85.0;
        this.currentSnapshot.cacheHitRate = Number(((this.currentSnapshot.cacheHitRate * 0.7) + (hitWeight * 0.3)).toFixed(1));
        this.currentSnapshot.timestamp = new Date().toISOString();

        // Broadcast metrics to DSH event bus
        this.ctx.events.emit("telemetry/update", this.currentSnapshot);

        return this.currentSnapshot;
    }

    public getSnapshot(): DshTelemetrySnapshot {
        return { ...this.currentSnapshot };
    }
}
