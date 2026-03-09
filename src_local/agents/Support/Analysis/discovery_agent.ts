import winston from "winston";
import { GoDiscoveryAdapter } from "../../../utils/go_discovery_adapter.ts";
import { DepthIntelligence } from "../../../utils/depth_intelligence.ts";
import * as fs from "node:fs";
import * as path from "node:path";
import { IGNORE_LIST } from "./parity_config";
import { SourceCodeParser } from "./source_code_parser.ts";

const logger = winston.child({ module: "DiscoveryAgent" });

/**
 * 🔭 DiscoveryAgent - PhD in Systemic Discovery
 */
export class DiscoveryAgent {
    orc: any; parser = new SourceCodeParser();
    constructor(orchestrator: any) { this.orc = orchestrator; }

    async runDiscoveryPhase(): Promise<[any, any[]]> {
        logger.info("🔭 Discovery Phase...");
        const root = this.orc.projectRoot.toString();
        const { results: raw, findings: goFindings } = await GoDiscoveryAdapter.scan(root, root, false);
        const filtered = raw.filter(f => f.path.replace(/\\/g, "/").startsWith(`src_local/agents/`));
        const { agents, findings: enrichFindings } = await this.enrich(filtered, root);
        const findings: any[] = [...goFindings, ...enrichFindings];
        this.mapDisparities(this.groupByPersona(agents), findings);
        const depth = await DepthIntelligence.calculateDepthAudit(root, this._getFiles(root), {});
        const ctx = await this.orc.contextEngine.analyzeProject();
        ctx.atomicUnits = agents; ctx.depthAudit = depth;
        findings.push(...await this.orc.runStrategicAudit(ctx, null, false), ...await this.orc.runObfuscationScan());
        return [ctx, findings];
    }

    private async enrich(raw: any[], root: string): Promise<{ agents: any[], findings: any[] }> {
        const findings: any[] = [];
        const agents = await Promise.all(raw.map(async f => {
            try {
                const c = await fs.promises.readFile(path.join(root, f.path), "utf-8");
                const a = await this.parser.analyze_file_logic(c, f.path);
                return a ? { ...f, units: [...(a.classes || []).map((n: any) => ({ name: n, type: "class", line: 1 })), ...(a.functions || []).map((n: any) => ({ name: n, type: "function", line: 1 }))] } : f;
            } catch (e: any) {
                findings.push({
                    type: "ERROR",
                    severity: "HIGH",
                    file: f.path,
                    issue: `Falha ao processar arquivo durante descoberta: ${e.message}`,
                    category: "Discovery",
                    context: "DiscoveryAgent"
                });
                return f;
            }
        }));
        return { agents, findings };
    }

    private groupByPersona(files: any[]) {
        const g: Record<string, any[]> = {};
        files.forEach(f => {
            const b = path.basename(f.path);
            if (IGNORE_LIST.includes(b) || b.startsWith("__")) return;
            const id = b.replace(/\.[^/.]+$/, "").replace(/_?(persona|agent|system|engine)$/, "").toLowerCase();
            (g[id] ||= []).push(f);
        });
        return g;
    }

    private mapDisparities(groups: Record<string, any[]>, findings: any[]) {
        Object.entries(groups).forEach(([id, files]) => {
            if (files.length < 2) return;
            this.processGroupDisparities(id, files, findings);
        });
    }

    private processGroupDisparities(id: string, files: any[], findings: any[]) {
        const norm = (n: string) => n.toLowerCase().replace(/_/g, "").replace(/init/g, "constructor");
        const all = new Set<string>();
        files.forEach(f => (f.units || []).filter((u: any) => u.name.includes("Persona")).forEach((u: any) => all.add(norm(u.name))));

        files.forEach(f => {
            const cur = (f.units || []).map((u: any) => norm(u.name));
            const miss = Array.from(all).filter(u => !cur.includes(u));
            if (miss.length) {
                findings.push({ type: "DISPARITY", severity: "MEDIUM", file: f.path, issue: `Persona '${id}' missing ${miss.length} units.`, category: "AtomicParity" });
            }
        });
    }

    private _getFiles(root: string) { return this.recursiveReaddir(root, [".ts", ".js", ".py", ".go", ".kt"]); }
    private recursiveReaddir(dir: string, exts: string[]): string[] {
        try {
            return fs.readdirSync(dir, { withFileTypes: true }).reduce((acc: string[], item) => {
                const full = path.join(dir, item.name);
                if (item.isDirectory()) return acc.concat(this.scanSubDir(full, exts));
                if (exts.includes(path.extname(item.name))) acc.push(full);
                return acc;
            }, []);
        } catch { return []; }
    }

    private scanSubDir(full: string, exts: string[]): string[] {
        const forbidden = /[\\/](\.git|node_modules|dist|artifacts|\.gemini)$/;
        return forbidden.test(full) ? [] : this.recursiveReaddir(full, exts);
    }
}
