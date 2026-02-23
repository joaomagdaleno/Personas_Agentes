import * as fs from "fs";
import * as path from "path";
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
 * 🗺️ TopologyEngine
 * Centraliza a inteligência de mapeamento de projeto, substituindo o project_cartographer.ts.
 */
export class TopologyEngine {
    private static IGNORE_DIRS = ["node_modules", ".git", ".idea", ".vscode", "__pycache__", "dist", "build", "coverage", ".gemini", "artifacts"];
    private static IGNORE_FILES = [".DS_Store", "Thumbs.db"];

    static scanProject(projectRoot: string): TopologyMap {
        const ROOTS = this._getProjectRoots(projectRoot);
        const sovereign = this._safeScan(ROOTS.SOVEREIGN);
        const shadow = this._safeScan(ROOTS.SHADOW);
        const scripts = this._safeScan(ROOTS.SCRIPTS);
        const native = this._safeScan(ROOTS.NATIVE);

        return {
            timestamp: new Date().toISOString(),
            sovereign: [...sovereign, ...scripts, ...native],
            shadow,
            scripts,
            gaps: []
        };
    }

    private static _getProjectRoots(root: string) {
        return {
            SOVEREIGN: path.join(root, "src_local"),
            SHADOW: "C:/Users/joaom/Documents/GitHub/legacy_restore",
            SCRIPTS: path.join(root, "scripts"),
            NATIVE: path.join(root, "src_native")
        };
    }

    private static _safeScan(dir: string): TopologyFile[] {
        return fs.existsSync(dir) ? this.scanDirectory(dir, dir) : [];
    }

    private static scanDirectory(dir: string, baseDir: string): TopologyFile[] {
        return fs.readdirSync(dir)
            .map(f => this._toItem(dir, f))
            .flatMap(item => this._processItem(item, baseDir));
    }

    private static _toItem(dir: string, file: string) {
        const full = path.join(dir, file);
        return { file, full, stat: fs.statSync(full) };
    }

    private static _processItem(item: any, baseDir: string): TopologyFile[] {
        if (item.stat.isDirectory()) {
            return this.IGNORE_DIRS.includes(item.file) ? [] : this.scanDirectory(item.full, baseDir);
        }
        return this.IGNORE_FILES.includes(item.file) ? [] : [this._createTopologyFile(item.full, item.file, item.stat, baseDir)];
    }

    private static _createTopologyFile(fullPath: string, file: string, stat: fs.Stats, baseDir: string): TopologyFile {
        return {
            path: path.relative(process.cwd(), fullPath),
            name: file,
            extension: path.extname(file),
            category: this.categorize(fullPath),
            size: stat.size,
            stack: this.identifyStack(file)
        };
    }

    private static categorize(filePath: string): "Agent" | "Core" | "Util" | "Script" | "Native" | "Unknown" {
        const low = filePath.toLowerCase();
        const map: Record<string, any> = { agents: "Agent", core: "Core", utils: "Util", scripts: "Script", native: "Native" };
        const match = Object.keys(map).find(k => low.includes(k));
        return match ? map[match] : "Unknown";
    }

    private static identifyStack(fileName: string): "TypeScript" | "Python" | "Go" | "Kotlin" | "Flutter" | "Dart" | undefined {
        const extMap: Record<string, any> = { ".ts": "TypeScript", ".py": "Python", ".go": "Go", ".kt": "Kotlin", ".dart": "Flutter" };
        const ext = Object.keys(extMap).find(e => fileName.endsWith(e));
        return ext ? extMap[ext] : undefined;
    }

    /**
     * Identifies Python agents that have a corresponding TypeScript version.
     */
    static findRedundantAgents(sovereignFiles: TopologyFile[]): TopologyFile[] {
        const tsFiles = this._getTSFilesSet(sovereignFiles);
        return sovereignFiles
            .filter(f => this._isPotentialRedundantPy(f))
            .filter(f => tsFiles.has(f.path.replace(/\.py$/, "")));
    }

    private static _getTSFilesSet(files: TopologyFile[]): Set<string> {
        return new Set(files.filter(f => f.extension === ".ts").map(f => f.path.replace(/\.ts$/, "")));
    }

    private static _isPotentialRedundantPy(f: TopologyFile): boolean {
        return f.extension === ".py" && f.path.includes("agents");
    }
}
