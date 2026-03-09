import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";
import winston from "winston";

const logger = winston.child({ module: "TopologyEngine" });

export interface TopologyFile {
    path: string;
    name: string;
    extension: string;
    category: "Agent" | "Core" | "Util" | "Script" | "Native" | "Unknown";
    size: number;
    stack?: "TypeScript" | "Python" | "Go" | "Kotlin" | "Flutter" | "Dart";
}

export interface TopologyMap {
    timestamp: string;
    sovereign: TopologyFile[];
    shadow: TopologyFile[];
    scripts: TopologyFile[];
    gaps: string[];
}

/**
 * 🗺️ TopologyEngine — Proxy centralizado via gRPC (Go Hub).
 */
export class TopologyEngine {
    constructor(private hubManager?: HubManagerGRPC) { }

    async scanProject(projectRoot: string): Promise<TopologyMap> {
        try {
            if (!this.hubManager) {
                logger.warn("⚠️ HubManager not provided to TopologyEngine. Returning empty map.");
                return { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
            }
            logger.info(`🗺️ [Topology] Requesting scan for: ${projectRoot}`);
            const results = await this.hubManager.scanTopology(projectRoot);
            return results || { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
        } catch (e: any) {
            logger.error(`🚨 gRPC topology scan failed: ${e.message}`);
            return { timestamp: new Date().toISOString(), sovereign: [], shadow: [], scripts: [], gaps: [] };
        }
    }

    /**
     * Identifies Python agents that have a corresponding TypeScript version.
     */
    static findRedundantAgents(sovereignFiles: TopologyFile[]): TopologyFile[] {
        const tsFiles = new Set(
            sovereignFiles.filter(f => f.extension === ".ts").map(f => f.path.replace(/\.ts$/, ""))
        );
        return sovereignFiles
            .filter(f => f.extension === ".py" && f.path.includes("agents"))
            .filter(f => tsFiles.has(f.path.replace(/\.py$/, "")));
    }
}

