import { EventEmitter } from "node:events";
import winston from "winston";

const logger = winston.child({ module: "EventBus" });

/**
 * 📡 Sovereign Event Bus — Mediator Pattern.
 * Typed, singleton event bus that decouples engines from the Orchestrator.
 * Engines emit/listen to events without importing each other.
 */

export type SystemEventMap = {
    "system:emergency": [{ score: number }];
    "system:health-check": [{ score: number; findings: any[] }];
    "system:halt-experimentation": [];
    "task:completed": [{ taskId: string; result: string }];
    "task:failed": [{ taskId: string; error: string }];
    "audit:findings": [{ findings: any[] }];
    "cache:updated": [];
};

export type EventName = keyof SystemEventMap;

class SovereignEventBus extends EventEmitter {
    override emit<K extends EventName>(event: K, ...args: SystemEventMap[K]): boolean {
        logger.debug(`📡 [EventBus] Emitting: ${String(event)}`);
        return super.emit(event as string, ...args);
    }

    override on<K extends EventName>(event: K, listener: (...args: SystemEventMap[K]) => void): this {
        return super.on(event as string, listener as any);
    }

    override once<K extends EventName>(event: K, listener: (...args: SystemEventMap[K]) => void): this {
        return super.once(event as string, listener as any);
    }
}

/** Global singleton — import this from any engine. */
export const eventBus = new SovereignEventBus();
