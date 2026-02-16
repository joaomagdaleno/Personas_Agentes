import winston from "winston";
import { Path } from "../../../core/path_utils.ts";

const logger = winston.child({ module: "TopologyGraphAgent" });

/**
 * 🕸️ Agente especialista em mapear a teia de conexões do projeto (Bun Version).
 * Gera código Mermaid para visualização da topologia.
 */
export class TopologyGraphAgent {
    /**
     * Gera um código Mermaid para visualização de fluxo baseado no mapa de contexto.
     */
    generateMermaidGraph(contextMap: Record<string, any>): string {
        logger.info("🕸️ [Topology] Mapeando grafo de dependências...");

        const lines = ["graph TD"];
        const nodes = new Set<string>();
        const validExtensions = ['.ts', '.py', '.tsx', '.js'];

        // Prioritiza nós CORE e AGENTS
        const entries = Object.entries(contextMap)
            .filter(([f]) => validExtensions.some(ext => f.endsWith(ext)) && !f.includes("node_modules") && !f.includes("dist"))
            .sort(([a], [b]) => {
                const scoreA = (a.includes("core/") ? 10 : 0) + (a.includes("agents/") ? 5 : 0);
                const scoreB = (b.includes("core/") ? 10 : 0) + (b.includes("agents/") ? 5 : 0);
                return scoreB - scoreA;
            });

        let connectionCount = 0;
        const MAX_CONNECTIONS = 150;

        for (const [file, data] of entries) {
            if (connectionCount >= MAX_CONNECTIONS) break;

            const nodeId = this.formatNodeId(file);
            const nodeLabel = new Path(file).name();

            if (!nodes.has(nodeId)) {
                nodes.add(nodeId);
                // Style nodes based on type
                if (file.includes("/core/")) lines.push(`    class ${nodeId} core;`);
                if (file.includes("/agents/")) lines.push(`    class ${nodeId} agent;`);
            }

            const dependencies = data.dependencies || [];
            for (const dep of dependencies) {
                if (connectionCount >= MAX_CONNECTIONS) break;
                // Filter trivial dependencies if getting full
                if (connectionCount > 100 && (dep.includes("utils") || dep.includes("types"))) continue;

                const depId = this.formatNodeId(dep.toString());
                lines.push(`    ${nodeId}["${nodeLabel}"] --> ${depId}`);
                connectionCount++;
            }
        }

        // Add styling definitions
        lines.push("    classDef core fill:#ff9999,stroke:#333,stroke-width:2px;");
        lines.push("    classDef agent fill:#99ccff,stroke:#333,stroke-width:2px;");

        logger.info(`✅ [Topology] Grafo gerado com ${connectionCount} conexões principais.`);
        return lines.join("\n");
    }

    private formatNodeId(str: string): string {
        return str.replace(/[\.\/\-@]/g, "_");
    }
}
