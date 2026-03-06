import { readFile, exists } from "node:fs/promises";
import * as path from "node:path";
import winston from "winston";
import { TsDepthScorer } from "./strategies/depth/TsDepthScorer.ts";

const logger = winston.child({ module: "DepthIntelligence" });

export interface DepthMetric {
    path: string;
    depth: number;
    status: "🚀 SOVEREIGN" | "⚠️ LEGACY-STYLE" | "📉 SHALLOW";
    complexity_rank: string;
}

export interface DepthSummary {
    stats: { SOVEREIGN: number; LEGACY: number; SHALLOW: number; };
    metrics: DepthMetric[];
}

/**
 * 🧠 Inteligência de Profundidade (Native Edition).
 * Cálculos de densidade lógica baseados em AST e Blocos Semânticos Rust.
 */
export class DepthIntelligence {
    static async calculateDepthAudit(projectRoot: string, tsFiles: string[], metadataCache: Record<string, any>): Promise<DepthSummary> {
        const metrics: DepthMetric[] = [];
        const stats = { SOVEREIGN: 0, LEGACY: 0, SHALLOW: 0 };

        for (const sovPath of tsFiles) {
            await this.processFileDepth(sovPath, projectRoot, metadataCache, metrics, stats);
        }
        return { stats, metrics };
    }

    private static async processFileDepth(sovPath: string, projectRoot: string, metadataCache: Record<string, any>, metrics: DepthMetric[], stats: any) {
        try {
            const relPath = path.relative(projectRoot, sovPath).replace(/\\/g, "/");
            const metadata = metadataCache[relPath] || { semantic_blocks: [] };

            // Use semantic blocks from Rust as atomic weight
            const atomicWeight = (metadata.semantic_blocks || []).length * 15;
            const tsDepth = await TsDepthScorer.calculate(sovPath, atomicWeight);

            const { status, rank } = this.determineSovereignty(tsDepth);

            if (status === "🚀 SOVEREIGN") stats.SOVEREIGN++;
            else if (status === "⚠️ LEGACY-STYLE") stats.LEGACY++;
            else stats.SHALLOW++;

            metrics.push({
                path: relPath,
                depth: tsDepth,
                status: status as DepthMetric["status"],
                complexity_rank: rank
            });
        } catch (err) {
            logger.error(`💥 Erro depths ${sovPath}: ${err}`);
        }
    }

    private static determineSovereignty(depth: number): { status: string, rank: string } {
        if (depth > 500) return { status: "🚀 SOVEREIGN", rank: "PhD (Arquitetura Profunda)" };
        if (depth > 200) return { status: "⚠️ LEGACY-STYLE", rank: "Senior (Lógica Estruturada)" };
        return { status: "📉 SHALLOW", rank: "Junior (Fluxo Simples)" };
    }
}
