import * as path from "path";
import * as cp from "child_process";
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
 * 🗺️ TopologyEngine — Delegação total ao Rust Analyzer (walkdir + serde_json).
 */
export class TopologyEngine {
    private static BINARY_PATH = path.resolve(process.cwd(), "src_native/analyzer/target/release/analyzer.exe");

    static scanProject(projectRoot: string): TopologyMap {
        try {
            const absRoot = path.resolve(projectRoot);
            const output = cp.execSync(`"${this.BINARY_PATH}" topology "${absRoot}"`, {
                encoding: "utf8",
                maxBuffer: 50 * 1024 * 1024
            });
            return JSON.parse(output);
        } catch (e: any) {
            logger.error(`🚨 Rust topology scan failed: ${e.message}`);
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

