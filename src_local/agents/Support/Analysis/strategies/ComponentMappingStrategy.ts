/**
 * 🗺️ ComponentMappingStrategy — specialized in mapping paths to system layers.
 */
export class ComponentMappingStrategy {
    static mapType(relPath: string): string {
        const p = relPath.toLowerCase().replace(/\\/g, "/");
        if (p.includes("/agents/typescript/strategic/")) return "AGENT";
        if (p.includes("/agents/typescript/specialized/")) return "AGENT";
        if (p.includes("/core/")) return "CORE";
        if (p.includes("/utils/")) return "UTIL";
        if (p.includes("/diagnostics/") || p.includes("/analysis/")) return "LOGIC";
        if (p.includes("/test/") || p.includes(".test.") || p.includes("_test.")) return "TEST";
        if (p.endsWith(".md") || p.endsWith(".txt")) return "DOC";
        return "UNKNOWN";
    }
}
