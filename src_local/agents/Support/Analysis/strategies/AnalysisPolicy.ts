import { Path } from "../../../../core/path_utils.ts";

/**
 * 🛠️ AnalysisPolicy — specialized in file filtering and ignore rules.
 */
export class AnalysisPolicy {
    private static IGNORED_DIRS = new Set(['.git', '__pycache__', 'build', 'node_modules', '.venv', '.gemini', '.idea', '.vscode', 'dist', 'out']);

    static shouldIgnore(path: Path): boolean {
        const pathStr = path.toString().replace(/\\/g, "/").toLowerCase();

        // Bloqueio cirúrgico para infraestrutura .agent
        if (pathStr.includes("/.agent/") || pathStr.startsWith(".agent/")) {
            // Só permitimos se pertencer à skill autorizada
            if (pathStr.includes("fast-android-build")) return false;
            return true;
        }

        return Array.from(this.IGNORED_DIRS).some(p => pathStr.includes(`/${p}/`) || pathStr.endsWith(`/${p}`));
    }

    static isAnalyable(path: Path): boolean {
        const name = path.name();
        return (name.endsWith('.py') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.yaml'));
    }
}
