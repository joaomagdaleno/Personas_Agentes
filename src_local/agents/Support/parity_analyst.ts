import winston from "winston";

const logger = winston.child({ module: "ParityAnalyst" });

/**
 * Assistente Técnico: Auditor de Simetria e Paridade de Stacks ⚖️ (Bun Version).
 */
export class ParityAnalyst {
    analyzeStackGaps(personas: any[]): any {
        const stats: Record<string, any> = {};
        for (const p of personas) {
            if (!stats[p.stack]) {
                stats[p.stack] = { telemetry: 0, reasoning: 0, modernity: 0, agents: new Set<string>() };
            }

            const m = typeof p.getMaturityMetrics === 'function' ? p.getMaturityMetrics() : {};
            stats[p.stack].agents.add(p.name);
            if (m.has_telemetry) stats[p.stack].telemetry += 1;
            if (m.has_reasoning) stats[p.stack].reasoning += 1;
            if (m.has_pathlib) stats[p.stack].modernity += 1;
        }

        const gaps = this.detectGaps(stats);
        return { stats, gaps };
    }

    private detectGaps(stats: Record<string, any>): string[] {
        const gaps: string[] = [];
        const pythonAgents = stats["Python"]?.agents || new Set<string>();
        for (const stack of ["Flutter", "Kotlin"]) {
            const stackAgents = stats[stack]?.agents || new Set<string>();
            for (const agent of pythonAgents) {
                if (!stackAgents.has(agent)) {
                    gaps.push(`GAP DE EXISTÊNCIA: O PhD ${agent} está ausente na stack ${stack}.`);
                }
            }
        }
        return gaps;
    }
}
