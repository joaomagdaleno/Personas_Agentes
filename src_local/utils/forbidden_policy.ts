import { join } from "node:path";

/**
 * 🛡️ ForbiddenPolicy — Rules for skipping directories and files.
 */
export class ForbiddenPolicy {
    static isForbiddenDir(dir: string): boolean {
        const normalized = dir.replace(/\\/g, "/").toLowerCase();
        const segments = normalized.split("/");

        if (this.hasForbiddenSegment(segments)) return true;
        if (segments.includes(".agent")) return this.isForbiddenAgentDir(normalized, segments);
        return false;
    }

    private static hasForbiddenSegment(segments: string[]): boolean {
        const forbidden = new Set([".git", ".gemini", "restore", "forensics", "__pycache__", "node_modules", ".venv", "dist", "build"]);
        return segments.some(p => forbidden.has(p));
    }

    private static isForbiddenAgentDir(normalized: string, segments: string[]): boolean {
        if (normalized.includes("fast-android-build")) return false;
        const sub = segments.slice(segments.indexOf(".agent"));
        const allowed = new Set([".agent", "skills"]);
        return !sub.every(p => allowed.has(p));
    }
}
