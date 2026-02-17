import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import { ParityReport, DepthMetric, AgentParityResult, AtomicFingerprint } from "./parity_types";
import { LEGACY_ALIASES, FILE_MAPPINGS, IGNORE_LIST } from "./parity_config";
import { extractPythonFingerprint, extractTSFingerprint, computeDeltas, computeScore, capitalize } from "./parity_utils";

const logger = winston.child({ module: "ParityAnalyst" });

/**
 * ⚖️ ParityAnalyst — PhD in Atomic Symmetry & Forensic Audit
 * Especialista em paridade cross-stack e migração legacy.
 */
export class ParityAnalyst {
    private legacyRoot: string;
    private tsRoot: string;
    private depthMetrics: DepthMetric[];

    constructor(
        legacyRoot = "C:/Users/joaom/Documents/GitHub/legacy_restore/src_local/agents",
        tsRoot = "src_local/agents",
        depthMetrics: DepthMetric[] = []
    ) {
        this.legacyRoot = legacyRoot;
        this.tsRoot = tsRoot;
        this.depthMetrics = depthMetrics;
    }

    /**
     * Compares two files and returns a parity score.
     */
    public compareFiles(legacyPath: string, sovereignPath: string): number {
        if (!fs.existsSync(legacyPath) || !fs.existsSync(sovereignPath)) return 0;

        const legacyContent = fs.readFileSync(legacyPath, "utf-8");
        const sovereignContent = fs.readFileSync(sovereignPath, "utf-8");
        const name = path.basename(legacyPath, path.extname(legacyPath));

        const legacyFP = extractPythonFingerprint(legacyContent, name);
        const sovereignFP = extractTSFingerprint(sovereignContent, capitalize(name));

        if (legacyFP && sovereignFP) {
            const deltas = computeDeltas(legacyFP, sovereignFP, name);
            return computeScore(deltas);
        }

        return this.computeGenericParity(legacyContent, sovereignContent);
    }

    private computeGenericParity(legacy: string, sovereign: string): number {
        let score = 100;
        const legacyLines = legacy.split("\n").filter(l => l.trim().length > 0).length;
        const sovLines = sovereign.split("\n").filter(l => l.trim().length > 0).length;

        if (legacyLines > 0) {
            const ratio = sovLines / legacyLines;
            if (ratio < 0.5) score -= 20;
            else if (ratio > 5.0) score -= 10;
        }

        const legacyDefs = (legacy.match(/def\s+(\w+)/g) || []).map(d => d.replace("def ", ""));
        const sovDefs = (sovereign.match(/(function\s+(\w+)|(\w+)\s*\(|(\w+)\s*=\s*\()/g) || []).length;

        if (legacyDefs.length > sovDefs * 2) score -= 30;

        return Math.max(0, score);
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
    analyzeAtomicParity(): ParityReport {
        const startTime = Date.now();
        const results: AgentParityResult[] = [];
        const stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const categories = ["Audit", "Content", "Strategic", "System"];

        const agentGroups = new Map<string, Array<{ stack: string; cat: string; fp: AtomicFingerprint; path: string }>>();

        for (const stack of stacks) {
            for (const cat of categories) {
                const tsDir = path.join(this.tsRoot, stack, cat);
                if (!fs.existsSync(tsDir)) continue;

                const tsFiles = fs.readdirSync(tsDir).filter(f => f.endsWith(".ts"));
                for (const tf of tsFiles) {
                    const agentName = tf.replace(".ts", "").toLowerCase();
                    const content = fs.readFileSync(path.join(tsDir, tf), "utf-8");
                    const fp = extractTSFingerprint(content, capitalize(agentName));
                    if (!fp) continue;

                    if (!agentGroups.has(agentName)) agentGroups.set(agentName, []);
                    agentGroups.get(agentName)!.push({ stack, cat, fp, path: path.join(tsDir, tf) });
                }
            }
        }

        for (const [agentName, instances] of agentGroups.entries()) {
            if (instances.length === 0) continue;
            const reference = instances.find(i => i.stack === "Python") ||
                instances.find(i => i.stack === "TypeScript") ||
                instances[0]!;

            for (const inst of instances) {
                if (inst === reference) {
                    results.push({
                        agent: agentName, stack: inst.stack, category: inst.cat,
                        status: "IDENTICAL", score: 100, deltas: [],
                        legacy: reference.fp, current: inst.fp
                    });
                    continue;
                }
                const deltas = computeDeltas(reference.fp, inst.fp, agentName);
                const realDeltas = deltas.filter(d => d.severity !== "INFO");
                const score = computeScore(deltas);

                results.push({
                    agent: agentName, stack: inst.stack, category: inst.cat,
                    status: realDeltas.length === 0 ? "IDENTICAL" : "DIVERGENT",
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
     * Forensic Legacy Audit: Compares current codebase against legacy_restore.
     */
    analyzeLegacyForensics(): any {
        const results: any[] = [];
        const gaps: any[] = [];

        const legPath = "C:/Users/joaom/Documents/GitHub/legacy_restore/src_local";
        if (!fs.existsSync(legPath)) {
            logger.warn(`🕵️ Forensic: Legacy path NOT found at ${legPath}`);
            return { results, gaps };
        }

        const legacyFiles = this.crawlDirectory(legPath, [".py"]);
        const currentFiles = this.crawlDirectory(path.join(process.cwd(), "src_local"), [".ts", ".py", ".go", ".kt", ".dart"]);

        for (const lPath of legacyFiles) {
            const fileName = path.basename(lPath);
            if (IGNORE_LIST.includes(fileName) || fileName.startsWith("__")) continue;

            const normName = fileName.replace(/\.py$/, "").replace(/_?persona$/, "").replace(/_?agent$/, "");
            const targetName = LEGACY_ALIASES[normName] || normName;

            let match = currentFiles.find(c => path.basename(c).toLowerCase().startsWith(targetName.toLowerCase()));

            if (!match && FILE_MAPPINGS[fileName]) {
                const targetPath = FILE_MAPPINGS[fileName]!;
                match = currentFiles.find(c => c.replace(/\\/g, "/").endsWith(targetPath));
            }

            if (!match) {
                gaps.push({ file: fileName, status: "MISSING", path: lPath });
            } else {
                const score = this.compareFiles(lPath, match);
                results.push({ legacy: fileName, current: path.basename(match), score, path: match });
            }
        }

        return { results, gaps };
    }

    private crawlDirectory(dir: string, extensions: string[]): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (["node_modules", ".git", "__pycache__"].includes(entry.name)) continue;
                results = results.concat(this.crawlDirectory(fullPath, extensions));
            } else if (extensions.includes(path.extname(entry.name))) {
                results.push(fullPath);
            }
        }
        return results;
    }

    formatMarkdownReport(report: ParityReport): string {
        let md = `## ⚖️ SIMETRIA ALFA: Paridade Cross-Stack (6 Linguagens)\n\n`;
        md += `> Inteligência de Sincronia entre Bun, Flutter, Go, Kotlin, Python e TypeScript | Timestamp: ${report.timestamp}\n\n`;

        md += `| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}% |\n`;
        md += `| **Unique Agents** | ${report.totalAgents} |\n`;
        md += `| **Total Instances** | ${report.totalInstances} |\n`;
        md += `| **Symmetric/Mirror** | ${report.symmetricCount} |\n`;
        md += `| **Divergent** | ${report.divergentCount} |\n\n`;

        md += `### 🌍 Cobertura por Stack\n\n`;
        md += `| Agent | Coverage | Stacks |\n| :--- | :---: | :--- |\n`;
        const coverageSorted = report.coverage.sort((a, b) => b.stacks.length - a.stacks.length);
        for (const c of coverageSorted) {
            md += `| ${c.agent} | ${c.stacks.length}/6 | ${c.stacks.join(", ")} |\n`;
        }
        md += `\n`;

        const forensics = this.analyzeLegacyForensics();
        md += `--- \n\n## 🕵️ AUDITORIA FORENSE (LEGACY RECOVERY)\n\n`;
        md += `| Legacy File | Target Sovereign | Paridade |\n| :--- | :--- | :---: |\n`;
        for (const f of forensics.results.slice(0, 15)) {
            const icon = f.score === 100 ? "✅" : (f.score > 80 ? "⚠️" : "🚨");
            md += `| \`${f.legacy}\` | \`${f.current}\` | ${icon} ${f.score}% |\n`;
        }
        md += `\n> Exibindo top 15 matches forenses. Total de Gaps: ${forensics.gaps.length}\n\n`;

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
