import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";
import winston from "winston";

const logger = winston.child({ module: "CogHelpers" });

/**
 * 🟦 CogHelpers - PhD in AI Connectivity (gRPC Proxy).
 */
export class CogHelpers {
    constructor(private hubManager?: HubManagerGRPC) { }

    getParams(o: { temperature?: number, max_tokens?: number }, def: number) {
        return {
            temperature: o.temperature ?? 0.7,
            num_predict: o.max_tokens ?? def
        };
    }

    async callRustBrain(prompt: string): Promise<string | null> {
        if (!this.hubManager) {
            logger.error("HubManager not initialized.");
            return null;
        }

        try {
            return await this.hubManager.reason(prompt);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error(`gRPC Reason call failed: ${msg}`);
            return null;
        }
    }

    // Legacy Support (No-op)
    async unloadModel(): Promise<boolean> { return true; }
}
