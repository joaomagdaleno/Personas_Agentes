import * as fs from "fs";
import * as path from "path";

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
 * 🗺️ TopologyEngine
 * Centraliza a inteligência de mapeamento de projeto, substituindo o project_cartographer.ts.
 */
export class TopologyEngine {
    private static IGNORE_DIRS = ["node_modules", ".git", ".idea", ".vscode", "__pycache__", "dist", "build", "coverage", ".gemini", "artifacts"];
    private static IGNORE_FILES = [".DS_Store", "Thumbs.db"];

    static scanProject(projectRoot: string): TopologyMap {
        const ROOTS = {
            SOVEREIGN: path.join(projectRoot, "src_local"),
            SHADOW: "C:/Users/joaom/Documents/GitHub/legacy_restore",
            SCRIPTS: path.join(projectRoot, "scripts"),
            NATIVE: path.join(projectRoot, "src_native")
        };

        const sovereign = fs.existsSync(ROOTS.SOVEREIGN) ? this.scanDirectory(ROOTS.SOVEREIGN, ROOTS.SOVEREIGN) : [];
        const shadow = fs.existsSync(ROOTS.SHADOW) ? this.scanDirectory(ROOTS.SHADOW, ROOTS.SHADOW) : [];
        const scripts = fs.existsSync(ROOTS.SCRIPTS) ? this.scanDirectory(ROOTS.SCRIPTS, ROOTS.SCRIPTS) : [];
        const native = fs.existsSync(ROOTS.NATIVE) ? this.scanDirectory(ROOTS.NATIVE, ROOTS.NATIVE) : [];

        // All active project files that are not legacy
        const allSovereign = [...sovereign, ...scripts, ...native];

        return {
            timestamp: new Date().toISOString(),
            sovereign: allSovereign,
            shadow: shadow,
            scripts: scripts,
            gaps: []
        };
    }

    private static scanDirectory(dir: string, baseDir: string): TopologyFile[] {
        let results: TopologyFile[] = [];
        const list = fs.readdirSync(dir);

        for (const file of list) {
            const fullPath = path.join(dir, file);
            const relativePath = path.relative(baseDir, fullPath);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                if (this.IGNORE_DIRS.includes(file)) continue;
                results = results.concat(this.scanDirectory(fullPath, baseDir));
            } else {
                if (this.IGNORE_FILES.includes(file)) continue;
                results.push({
                    path: path.relative(process.cwd(), fullPath),
                    name: file,
                    extension: path.extname(file),
                    category: this.categorize(fullPath),
                    size: stat.size,
                    stack: this.identifyStack(file)
                });
            }
        }

        return results;
    }

    private static categorize(filePath: string): "Agent" | "Core" | "Util" | "Script" | "Native" | "Unknown" {
        const low = filePath.toLowerCase();
        if (low.includes("agents")) return "Agent";
        if (low.includes("core")) return "Core";
        if (low.includes("utils")) return "Util";
        if (low.includes("scripts")) return "Script";
        if (low.includes("native")) return "Native";
        return "Unknown";
    }

    private static identifyStack(fileName: string): "TypeScript" | "Python" | "Go" | "Kotlin" | "Flutter" | "Dart" | undefined {
        if (fileName.endsWith(".ts")) return "TypeScript";
        if (fileName.endsWith(".py")) return "Python";
        if (fileName.endsWith(".go")) return "Go";
        if (fileName.endsWith(".kt")) return "Kotlin";
        if (fileName.endsWith(".dart")) return "Flutter";
        return undefined;
    }

    /**
     * Identifies Python agents that have a corresponding TypeScript version.
     */
    static findRedundantAgents(sovereignFiles: TopologyFile[]): TopologyFile[] {
        const redundant: TopologyFile[] = [];
        const pyFiles = sovereignFiles.filter(f => f.extension === ".py" && f.path.includes("agents"));
        const tsFiles = new Set(sovereignFiles.filter(f => f.extension === ".ts").map(f => f.path.replace(/\.ts$/, "")));

        for (const py of pyFiles) {
            const base = py.path.replace(/\.py$/, "");
            if (tsFiles.has(base)) {
                redundant.push(py);
            }
        }
        return redundant;
    }
}
