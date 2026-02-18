import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ParityReport, DepthMetric, AgentParityResult, AtomicFingerprint } from "./parity_types";
import { IGNORE_LIST } from "./parity_config";
import { extractPythonFingerprint, extractTSFingerprint, computeDeltas, computeScore, capitalize } from "./parity_utils";

const logger = winston.child({ module: "ParityAnalyst" });

/**
 * ⚖️ ParityAnalyst — PhD in Atomic Symmetry & Forensic Audit
 * Especialista em paridade cross-stack nativa (Soberania 2.0).
 */
export class ParityAnalyst {
    private tsRoot: string;
    private depthMetrics: DepthMetric[];

    constructor(
        tsRoot = "src_local/agents",
        depthMetrics: DepthMetric[] = []
    ) {
        this.tsRoot = tsRoot;
        this.depthMetrics = depthMetrics;
    }


    /**
     * Compatibility method for ContextEngine.
     * @param _personas Ignored in favor of direct FS scan.
     */
    analyzeStackGaps(_personas: any[]): ParityReport {
        return this.analyzeAtomicParity();
    }

    /**
     * Internal Cross-Stack Symmetry Analysis.
     */
    public analyzeAtomicParity(): ParityReport {
        const startTime = Date.now();
        const results: AgentParityResult[] = [];
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const categories = ["Audit", "Content", "Strategic", "System"];

        const agentGroups = new Map<string, Array<{ stack: string; cat: string; fp: AtomicFingerprint; path: string }>>();

        for (const stack of stacks) {
            for (const cat of categories) {
                const tsDir = path.join(this.tsRoot, stack, cat);
                if (!fs.existsSync(tsDir)) continue;

                const files = fs.readdirSync(tsDir).filter(f => /\.(ts|tsx|go|kt|py|dart)$/.test(f));
                for (const tf of files) {
                    const agentName = tf.replace(/\.(ts|tsx|go|kt|py|dart)$/, "").toLowerCase();
                    const content = fs.readFileSync(path.join(tsDir, tf), "utf-8");

                    let fp: AtomicFingerprint | null;
                    if (tf.endsWith(".py")) fp = extractPythonFingerprint(content, capitalize(agentName));
                    else fp = extractTSFingerprint(content, capitalize(agentName)); // Best approximation for others

                    if (!fp) continue;

                    if (!agentGroups.has(agentName)) agentGroups.set(agentName, []);
                    agentGroups.get(agentName)!.push({ stack, cat, fp, path: path.join(tsDir, tf) });
                }
            }
        }

        for (const [agentName, instances] of agentGroups.entries()) {
            if (instances.length === 0) continue;

            // Native Sovereignty: Unified Persona Reference
            const reference = instances.find(i => i.stack === "TypeScript") ||
                instances.find(i => i.stack === "Bun") ||
                instances[0]!;

            for (const inst of instances) {
                const deltas = computeDeltas(reference.fp, inst.fp, agentName);
                const realDeltas = deltas.filter(d => d.severity === "CRITICAL" || d.severity === "HIGH" || d.severity === "MEDIUM");
                const score = computeScore(deltas);

                results.push({
                    agent: agentName, stack: inst.stack, category: inst.cat,
                    status: (inst === reference || realDeltas.length === 0) ? "IDENTICAL" : "DIVERGENT",
                    score, deltas, legacy: reference.fp, current: inst.fp
                });
            }
        }


        const symmetricCount = results.filter(r => r.status === "IDENTICAL").length;
        const divergentCount = results.filter(r => r.status === "DIVERGENT").length;
        const overallParity = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
            : 0;

        const byStack: Record<string, { total: number; symmetric: number; parity: number }> = {};
        const byCategory: Record<string, { total: number; symmetric: number; parity: number }> = {};

        for (const r of results) {
            if (!byStack[r.stack]) byStack[r.stack] = { total: 0, symmetric: 0, parity: 0 };
            byStack[r.stack]!.total++;
            if (r.status === "IDENTICAL") byStack[r.stack]!.symmetric++;

            if (!byCategory[r.category]) byCategory[r.category] = { total: 0, symmetric: 0, parity: 0 };
            byCategory[r.category]!.total++;
            if (r.status === "IDENTICAL") byCategory[r.category]!.symmetric++;
        }

        for (const k of Object.keys(byStack)) {
            const stackResults = results.filter(r => r.stack === k);
            byStack[k]!.parity = stackResults.length > 0 ? Math.round(stackResults.reduce((sum, r) => sum + r.score, 0) / stackResults.length) : 0;
        }
        for (const k of Object.keys(byCategory)) {
            const catResults = results.filter(r => r.category === k);
            byCategory[k]!.parity = catResults.length > 0 ? Math.round(catResults.reduce((sum, r) => sum + r.score, 0) / catResults.length) : 0;
        }

        const criticalDeltas = results.flatMap(r => r.deltas.filter(d => d.severity === "CRITICAL"));
        const elapsed = Date.now() - startTime;
        const coverage = Array.from(agentGroups.entries()).map(([agent, insts]) => ({
            agent, stacks: insts.map(i => i.stack)
        }));

        return {
            timestamp: new Date().toISOString(),
            totalAgents: agentGroups.size,
            totalInstances: results.length,
            symmetricCount, divergentCount,
            overallParity,
            byStack, byCategory,
            coverage,
            results,
            criticalDeltas
        };
    }

    /**
     * Native Sovereign v8.0: Legacy Forensics Retired.
     * All agents are now verified cross-stack within the local repository.
     */


    formatMarkdownReport(report: ParityReport): string {
        let md = `## ⚖️ SINCRO-NATIVA: Consistência Multi-Stack (Soberania 2.0)\n\n`;
        md += `> Inteligência de Sincronia Pura entre Bun, Flutter, Go, Kotlin, Python e TypeScript | Zero Legacy Reference.\n\n`;

        md += `| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}% |\n`;
        md += `| **Personas Identificadas** | ${report.totalAgents} |\n`;
        md += `| **Instalações Ativas** | ${report.totalInstances} |\n`;
        md += `| **Symmetry Mirror** | ${report.symmetricCount} |\n`;
        md += `| **Divergências** | ${report.divergentCount} |\n\n`;

        md += `### 🌍 Cobertura Global por Persona\n\n`;
        md += `| Persona | Fidelidade | Stacks Ativas |\n| :--- | :---: | :--- |\n`;
        const coverageSorted = report.coverage.sort((a, b) => b.stacks.length - a.stacks.length);
        for (const c of coverageSorted) {
            md += `| ${c.agent} | ${c.stacks.length}/6 | ${c.stacks.join(", ")} |\n`;
        }
        md += `\n`;

        return md;
    }


    getVitalStatus(report: ParityReport): string {
        if (report.overallParity >= 95) return `${report.overallParity}% Atômica`;
        if (report.overallParity >= 80) return `${report.overallParity}% Parcial`;
        return `${report.overallParity}% Crítica`;
    }

    /** Parity: _detect_gaps — Extracts gap entries from agent parity results. */
    private _detect_gaps(results: any[]): any[] {
        return results.filter(r => r.depth === "PARITY_GAP" || r.depth === "SHALLOW");
    }
}
