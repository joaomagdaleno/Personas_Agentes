import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ParityReport, DepthMetric, AgentParityResult, AtomicFingerprint } from "./parity_types";
import { extractPythonFingerprint, extractTSFingerprint, computeDeltas, computeScore, capitalize } from "./parity_utils";

const logger = winston.child({ module: "ParityAnalyst" });

/**
 * ⚖️ ParityAnalyst — PhD in Atomic Symmetry & Forensic Audit
 */
export class ParityAnalyst {
    private tsRoot: string;
    constructor(tsRoot = "src_local/agents", _metrics: DepthMetric[] = []) { this.tsRoot = tsRoot; }

    analyzeStackGaps(_personas: any[]): ParityReport { return this.analyzeAtomicParity(); }

    public analyzeAtomicParity(): ParityReport {
        const groups = this.groupAgentInstances();
        const results = Array.from(groups.entries()).flatMap(([name, insts]) => this.compareInstances(name, insts));

        const byStack: any = {}, byCategory: any = {};
        results.forEach(r => {
            [byStack[r.stack] = byStack[r.stack] || { total: 0, symmetric: 0, parity: 0 }, byCategory[r.category] = byCategory[r.category] || { total: 0, symmetric: 0, parity: 0 }]
                .forEach(st => { st.total++; if (r.status === "IDENTICAL") st.symmetric++; });
        });

        Object.entries(byStack).forEach(([k, st]: any) => st.parity = this.avgScore(results.filter(r => r.stack === k)));
        Object.entries(byCategory).forEach(([k, st]: any) => st.parity = this.avgScore(results.filter(r => r.category === k)));

        return {
            timestamp: new Date().toISOString(), totalAgents: groups.size, totalInstances: results.length,
            symmetricCount: results.filter(r => r.status === "IDENTICAL").length, divergentCount: results.filter(r => r.status === "DIVERGENT").length,
            overallParity: this.avgScore(results), byStack, byCategory, results,
            criticalDeltas: results.flatMap(r => r.deltas.filter(d => d.severity === "CRITICAL")),
            coverage: Array.from(groups.entries()).map(([agent, insts]) => ({ agent, stacks: insts.map(i => i.stack) }))
        };
    }

    private groupAgentInstances(): Map<string, any[]> {
        const groups = new Map<string, any[]>();
        ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"].forEach(stack => {
            ["Audit", "Content", "Strategic", "System"].forEach(cat => {
                const dir = path.join(this.tsRoot, stack, cat);
                if (fs.existsSync(dir)) fs.readdirSync(dir).filter(f => /\.(ts|tsx|go|kt|py|dart)$/.test(f)).forEach(tf => {
                    const name = tf.replace(/\.(ts|tsx|go|kt|py|dart)$/, "").toLowerCase(), content = fs.readFileSync(path.join(dir, tf), "utf-8");
                    const fp = tf.endsWith(".py") ? extractPythonFingerprint(content, capitalize(name)) : extractTSFingerprint(content, capitalize(name));
                    if (fp) (groups.get(name) || groups.set(name, []).get(name)!).push({ stack, cat, fp, path: path.join(dir, tf) });
                });
            });
        });
        return groups;
    }

    private compareInstances(name: string, instances: any[]): AgentParityResult[] {
        const ref = instances.find(i => i.stack === "TypeScript") || instances.find(i => i.stack === "Bun") || instances[0]!;
        return instances.map(inst => {
            const deltas = computeDeltas(ref.fp, inst.fp, name);
            return {
                agent: name, stack: inst.stack, category: inst.cat, score: computeScore(deltas), deltas, legacy: ref.fp, current: inst.fp,
                status: (inst === ref || !deltas.some(d => /CRITICAL|HIGH|MEDIUM/.test((d.severity || "").toUpperCase()))) ? "IDENTICAL" : "DIVERGENT"
            };
        });
    }

    private avgScore(res: any[]) { return res.length ? Math.round(res.reduce((s, r) => s + r.score, 0) / res.length) : 0; }

    formatMarkdownReport(report: ParityReport): string {
        let md = `## ⚖️ SINCRO-NATIVA: Consistência Multi-Stack (Soberania 2.0)\n\n> Zero Legacy Reference.\n\n| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}% |\n| **Personas Identificadas** | ${report.totalAgents} |\n| **Instalações Ativas** | ${report.totalInstances} |\n| **Symmetry Mirror** | ${report.symmetricCount} |\n| **Divergências** | ${report.divergentCount} |\n\n### 🌍 Cobertura Global\n\n| Persona | Fidelidade | Stacks |\n| :--- | :---: | :--- |\n`;
        report.coverage.sort((a, b) => b.stacks.length - a.stacks.length).forEach(c => md += `| ${c.agent} | ${c.stacks.length}/6 | ${c.stacks.join(", ")} |\n`);
        return md;
    }

    getVitalStatus(report: ParityReport): string { return `${report.overallParity}% ${report.overallParity >= 95 ? "Atômica" : (report.overallParity >= 80 ? "Parcial" : "Crítica")}`; }
    private _detect_gaps(results: any[]) { return results.filter(r => r.depth === "PARITY_GAP" || r.depth === "SHALLOW"); }
}
