import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ParityReport, DepthMetric, AgentParityResult, AtomicFingerprint } from "./parity_types";
import { computeDeltas, computeScore } from "./parity_utils";
import { InstanceGrouper } from "./InstanceGrouper.ts";
import { ParityReporter } from "./ParityReporter.ts";

const logger = winston.child({ module: "ParityAnalyst" });

/**
 * ⚖️ ParityAnalyst — PhD in Atomic Symmetry & Forensic Audit
 */
export class ParityAnalyst {
    private tsRoot: string;
    constructor(tsRoot = "src_local/agents", _metrics: DepthMetric[] = []) { this.tsRoot = tsRoot; }

    analyzeStackGaps(_personas: any[]): ParityReport { return this.analyzeAtomicParity(); }

    public analyzeAtomicParity(): ParityReport {
        const groups = InstanceGrouper.group(this.tsRoot);
        const results = Array.from(groups.entries()).flatMap(([name, insts]) => this.compareInstances(name, insts));

        const byStack = this.aggregateBy(results, "stack");
        const byCategory = this.aggregateBy(results, "category");

        return {
            timestamp: new Date().toISOString(), totalAgents: groups.size, totalInstances: results.length,
            symmetricCount: results.filter(r => r.status === "IDENTICAL").length, divergentCount: results.filter(r => r.status === "DIVERGENT").length,
            overallParity: this.avgScore(results), byStack, byCategory, results,
            criticalDeltas: results.flatMap(r => r.deltas.filter(d => d.severity === "CRITICAL")),
            coverage: Array.from(groups.entries()).map(([agent, insts]) => ({ agent, stacks: insts.map(i => i.stack) }))
        };
    }

    private aggregateBy(results: AgentParityResult[], key: "stack" | "category"): any {
        const agg: any = {};
        results.forEach(r => {
            const st = agg[r[key]] ||= { total: 0, symmetric: 0, parity: 0 };
            st.total++;
            if (r.status === "IDENTICAL") st.symmetric++;
        });
        Object.keys(agg).forEach(k => agg[k].parity = this.avgScore(results.filter(r => r[key] === k)));
        return agg;
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
        return ParityReporter.formatMarkdown(report);
    }

    getVitalStatus(report: ParityReport): string { return `${report.overallParity}% ${report.overallParity >= 95 ? "Atômica" : (report.overallParity >= 80 ? "Parcial" : "Crítica")}`; }
    private _detect_gaps(results: any[]) { return results.filter(r => r.depth === "PARITY_GAP" || r.depth === "SHALLOW"); }
}
