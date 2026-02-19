import { Path } from "../core/path_utils.ts";

/**
 * 🧠 ContextHelpers - PhD in Dependency & Criticality Logic
 */
export class ContextHelpers {
    static resolveDependency(dep: string, map: Record<string, any>): string | null {
        const re = new RegExp(`${dep.toLowerCase().replace(/\./g, '/')}(\\.ts|\\.py|$)`);
        return Object.keys(map).find(f => f.toLowerCase().match(re)) || null;
    }

    static getCriticalityScore(f: string, map: Record<string, any>): number {
        const entry = map[f];
        if (!entry) return 0;
        return (entry.complexity || 0) * (entry.coupling?.total || 1);
    }

    static hasForbiddenSegment(segments: string[]): boolean {
        const forbidden = new Set([".git", ".gemini", "restore", "forensics", "__pycache__", "node_modules", ".venv", "dist", "build"]);
        return segments.some(p => forbidden.has(p));
    }
}
