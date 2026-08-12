import { CognitiveEngine } from "../../utils/cognitive_engine";
import { Path } from "../../core/path_utils";
import winston from "winston";

const logger = winston.child({ module: "MasterOrchestratorService" });

/**
 * 🎼 MasterOrchestratorService
 * Serviço soberano que unifica as capacidades do Master Orchestrator:
 * - Geração de Documentação de Cabeçalho (DocGen)
 * - Mapeamento e Geração de Grafo de Topologia (TopologyGraph)
 * - Rastreamento e Gestão de Orquestração
 */
export class MasterOrchestratorService {
    private brain: CognitiveEngine;

    constructor() {
        this.brain = new CognitiveEngine();
    }

    /**
     * Gera uma docstring de cabeçalho soberana para um arquivo.
     */
    async generateDocstring(fileName: string, content: string): Promise<string> {
        logger.info(`✍️ [MasterOrchestrator] Gerando propósito para ${fileName}...`);
        const partialContent = content.slice(0, 1500);

        const prompt = `Analise o código abaixo e gere uma documentação de cabeçalho concisa em PORTUGUÊS.
Arquivo: ${fileName}
Amostra de Código:
${partialContent}

Requisitos:
1. Explique o PROPÓSITO principal do arquivo.
2. Liste as principais responsabilidades.
3. Use o formato JSDoc (/** ... */) para TypeScript ou Docstring (""" ... """) para Python.
4. Responda APENAS com o bloco de comentário.`;

        try {
            const answer = await this.brain.reason(prompt);
            return answer ?? "/** Falha na geração automática de documentação (Resposta Nula). */";
        } catch (error) {
            logger.error(`❌ [MasterOrchestrator] Falha na geração de documentação: ${error}`);
            return "/** Falha na geração automática de documentação. */";
        }
    }

    /**
     * Gera o grafo Mermaid da topologia do sistema.
     */
    generateMermaidGraph(map: Record<string, any>): string {
        logger.info("🕸️ [MasterOrchestrator] Mapeando grafo de topologia...");
        const lines = ["graph TD"], nodes = new Set<string>();
        const valid = ['.ts', '.py', '.tsx', '.js', '.zig'];
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

    private _score(f: string) { return (f.includes("/core/") ? 10 : 0) + (f.includes("/engines/") ? 5 : 0); }
    private _id(s: string) { return s.replace(/[\.\/\-@]/g, "_"); }
    private _style(id: string, f: string, l: string[]) {
        if (f.includes("/core/")) l.push(`    class ${id} core;`);
        else if (f.includes("/engines/")) l.push(`    class ${id} agent;`);
    }
}

// Aliases retrocompatíveis
export class DocGenAgent extends MasterOrchestratorService {}
export class TopologyGraphAgent extends MasterOrchestratorService {}
