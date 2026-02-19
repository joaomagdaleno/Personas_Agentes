import winston from "winston";
import { GoDiscoveryAdapter } from "../../../utils/go_discovery_adapter.ts";
import { DepthIntelligence } from "../../../utils/depth_intelligence.ts";
import * as fs from "node:fs";
import * as path from "node:path";
import { IGNORE_LIST } from "./parity_config";
import { SourceCodeParser } from "./source_code_parser.ts";

const logger = winston.child({ module: "DiscoveryAgent" });

export class DiscoveryAgent {
    orc: any;
    parser: SourceCodeParser;
    constructor(orchestrator: any) { this.orc = orchestrator; this.parser = new SourceCodeParser(); }

    async runDiscoveryPhase(): Promise<[any, any[]]> {
        logger.info("🔭 Discovery Phase (Sovereign Multi-Stack)...");
        const root = this.orc.projectRoot.toString(), stacks = ["Bun", "Flutter", "Go", "Kotlin", "Python", "TypeScript"];
        const raw = GoDiscoveryAdapter.scan(root, root, false);
        const filtered = raw.filter(f => stacks.some(s => f.path.replace(/\\/g, "/").startsWith(`src_local/agents/${s}`)));

        const allAgentFiles = await this.enrichAgentFiles(filtered, root);
        const findings: any[] = [];
        this.mapDisparities(this.groupByPersona(allAgentFiles), findings);

        const native = this.recursiveReaddir(root, [".ts", ".tsx", ".js", ".py", ".go", ".kt"]);
        const depth = await DepthIntelligence.calculateDepthAudit(root, native, [], allAgentFiles);
        const ctx = await this.orc.contextEngine.analyzeProject();
        ctx.atomicUnits = allAgentFiles; ctx.depthAudit = depth;

        findings.push(...await this.orc.runStrategicAudit(ctx, null, false), ...await this.orc.runObfuscationScan());
        return [ctx, findings];
    }

    private async enrichAgentFiles(raw: any[], root: string) {
        return Promise.all(raw.map(async f => {
            try {
                const content = await fs.promises.readFile(path.join(root, f.path), "utf-8");
                const analysis = this.parser.analyze_file_logic(content, f.path);
                if (!analysis) return f;
                return { ...f, units: [...analysis.classes.map((c: any) => ({ name: c, type: "class", line: 1 })), ...(analysis.functions || []).map((fn: any) => ({ name: fn, type: "function", line: 1 }))] };
            } catch { return f; }
        }));
    }

    private groupByPersona(files: any[]) {
        const groups: Record<string, any[]> = {};
        files.forEach(f => {
            const ext = path.extname(f.path), name = path.basename(f.path, ext);
            if (IGNORE_LIST.includes(path.basename(f.path)) || path.basename(f.path).startsWith("__")) return;
            const pid = name.replace(/_?(persona|agent|system|engine)$/, "").toLowerCase();
            if (!groups[pid]) groups[pid] = [];
            groups[pid].push(f);
        });
        return groups;
    }

    private mapDisparities(groups: Record<string, any[]>, findings: any[]) {
        const norm = (n: string) => n.toLowerCase().replace(/_/g, "").replace(/init/g, "constructor");
        Object.entries(groups).forEach(([id, files]) => {
            if (files.length < 2) return;
            const all = new Set<string>();
            files.forEach(f => (f.units || []).forEach((u: any) => all.add(norm(u.name))));
            files.forEach(f => {
                const cur = (f.units || []).map((u: any) => norm(u.name));
                const miss = Array.from(all).filter(u => !cur.includes(u));
                if (miss.length) findings.push({ type: "DISPARITY", severity: miss.length > 3 ? "HIGH" : "MEDIUM", file: f.path, issue: `Persona '${id}'@${f.path.split('/')[2]} missing ${miss.length} units.`, category: "AtomicParity" });
            });
        });
    }

    private recursiveReaddir(dir: string, exts: string[]): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        try {
            const list = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of list) {
                const full = path.join(dir, item.name);
                if (item.isDirectory()) {
                    if (["node_modules", ".git", ".gemini", "dist", "artifacts"].includes(item.name)) continue;
                    results = results.concat(this.recursiveReaddir(full, exts));
                } else if (exts.includes(path.extname(item.name))) results.push(full);
            }
        } catch { }
        return results;
    }
}
