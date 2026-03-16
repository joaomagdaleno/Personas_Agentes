import winston from "winston";
import { Path } from "../../core/path_utils.ts";

const logger = winston.child({ module: "TopologyGraphAgent" });

/**
 * 🕸️ TopologyGraphAgent - PhD in Systemic Mapping
 */
export class TopologyGraphAgent {
    generateMermaidGraph(map: Record<string, any>): string {
        logger.info("🕸️ [Topology] Mapeando grafo...");
        const lines = ["graph TD"], nodes = new Set<string>();
        const valid = ['.ts', '.py', '.tsx', '.js'];
        const entries = Object.entries(map).filter(([f]) => valid.some(e => f.endsWith(e)) && !/[\\/](node_modules|dist)$/.test(f)).sort(([a], [b]) => this._score(b) - this._score(a));

        let count = 0;
        for (const [f, d] of entries) {
            if (count >= 150) break;
            const nid = this._id(f), lbl = new Path(f).name();
            if (!nodes.has(nid)) { nodes.add(nid); this._style(nid, f, lines); }
            (d.dependencies || []).forEach((dep: any) => {
                if (count < 150 && !(count > 100 && /(utils|types)/.test(dep))) {
                    lines.push(`    ${nid}["${lbl}"] --> ${this._id(dep.toString())}`);
                    count++;
                }
            });
        }
        lines.push("    classDef core fill:#ff9999,stroke:#333;");
        lines.push("    classDef agent fill:#99ccff,stroke:#333;");
        return lines.join("\n");
    }

    private _score(f: string) { return (f.includes("/core/") ? 10 : 0) + (f.includes("/agents/") ? 5 : 0); }
    private _id(s: string) { return s.replace(/[\.\/\-@]/g, "_"); }
    private _style(id: string, f: string, l: string[]) {
        if (f.includes("/core/")) l.push(`    class ${id} core;`);
        else if (f.includes("/agents/")) l.push(`    class ${id} agent;`);
    }
}
