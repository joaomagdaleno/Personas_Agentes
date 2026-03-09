import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

/**
 * 🟦 CogHelpers - PhD in AI Connectivity (gRPC Proxy).
 */
export class CogHelpers {
    constructor(private hubManager?: HubManagerGRPC) { }

    getParams(o: any, def: number) {
        return {
            temperature: o.temperature || 0.7,
            num_predict: o.max_tokens || def
        };
    }

    async callRustBrain(prompt: string): Promise<string | null> {
        if (!this.hubManager) {
            console.error("❌ [CogHelpers] HubManager not initialized.");
            return null;
        }

        try {
            return await this.hubManager.reason(prompt);
        } catch (error) {
            console.error("❌ [CogHelpers] gRPC Reason call failed:", error);
            return null;
        }
    }

    // Legacy Support (No-op)
    async unloadModel() { return true; }
}
