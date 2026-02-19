import winston from "winston";
import { Path } from "./path_utils.ts";
import { TaskOrchestrator } from "./task_orchestrator.ts";
import * as ts from "typescript";

const logger = winston.child({ module: "AuditEngine" });

/**
 * 🏛️ AuditEngine — PhD in Systemic Integrity & Intelligence Orquestration
 */
export class AuditEngine {
    orc: any; root: Path; taskOrc: TaskOrchestrator;
    constructor(orchestrator: any) {
        this.orc = orchestrator;
        this.root = new Path(orchestrator.projectRoot.toString());
        this.taskOrc = new TaskOrchestrator(orchestrator);
    }

    async runStrategicAudit(context: any, objective: string | null = null, dryRun: boolean = false): Promise<[any[], number]> {
        const startT = Date.now();
        const target = objective || `Validar integridade ${Array.from(context.identity?.stacks || ["Python"]).join(', ')}`;
        const active = this.taskOrc.selectActivePhds(target, context.identity?.stacks || new Set(["Python"]), this.orc.personas);
        const changedFiles = await this.detectChanges(Object.keys(context.map || {}));
        const findings = await this.taskOrc.runAuditCycle(active, target, changedFiles, context);

        await this.enrichAuditFindings(findings, Object.keys(changedFiles), context);
        if (!dryRun) this.persistAuditState(findings, changedFiles, context);
        else logger.info("🛡️ [AuditEngine] Dry-Run active.");
        return [findings, startT];
    }

    private async enrichAuditFindings(findings: any[], changedFiles: string[], context: any): Promise<void> {
        for (const f of changedFiles) {
            const content = await Bun.file(this.root.join(f).toString()).text();
            if (f.match(/\.ts$|\.tsx$/)) findings.push(...(await import("../agents/Support/Analysis/logic_auditor.ts")).LogicAuditor.scanFile(ts.createSourceFile(f, content, ts.ScriptTarget.Latest, true)));
            else if (f.endsWith(".md")) findings.push(...(await import("../agents/Support/Reporting/markdown_auditor.ts")).MarkdownAuditor.auditMarkdown(f, content));
            const cog = await (await import("../agents/Support/Diagnostics/cognitive_analyst.ts")).CognitiveAnalyst.analyzeIntent(f, content, this.orc);
            if (cog) findings.push(cog);
        }
        findings.push(...await (new (await import("../agents/Support/Security/security_sentinel_agent.ts")).SecuritySentinelAgent()).scanProject(context.map));
        findings.push(...await (new (await import("../utils/dependency_auditor.ts")).DependencyAuditor(this.root.toString())).checkSubmoduleStatus());
    }

    private persistAuditState(findings: any[], changed: Record<string, string>, context: any): void {
        Object.entries(changed).forEach(([p, h]) => this.orc.cacheManager.update(p, h));
        this.orc.cacheManager.save();
        this.orc.stabilityLedger.update(findings, context.map);
    }

    private async detectChanges(mapFiles: string[]): Promise<Record<string, string>> {
        const results = await this.orc.executor.runParallel(async (p: string) => {
            const h = await this.orc.cacheManager.getFileHash(this.root.join(p));
            return this.orc.cacheManager.isChanged(p, h) ? { path: p, hash: h } : null;
        }, mapFiles);
        return results.reduce((acc: Record<string, string>, r: any) => { if (r) acc[r.path] = r.hash; return acc; }, {});
    }

    async runObfuscationScan(contextMap: any = null): Promise<any[]> {
        const startT = Date.now(), hunter = new (await import("../agents/Support/Security/obfuscation_hunter.ts")).ObfuscationHunter();
        let findings: any[] = [];
        const tMap = contextMap || this.orc.contextEngine.map;
        for (const [f, d] of Object.entries(tMap)) {
            if (f.match(/\.ts$|\.js$|\.py$/) && await Bun.file(this.root.join(f).toString()).exists()) {
                const c = await Bun.file(this.root.join(f).toString()).text();
                findings = findings.concat((await hunter.scanFile(f, c)).map((fi: any) => ({ ...fi, file: f })));
            }
        }
        logger.info(`🕵️ [AuditEngine] Obfuscation scan concluído em ${((Date.now() - startT) / 1000).toFixed(4)}s.`);
        return findings;
    }

    async runStagedAudit(context: any, dryRun: boolean = true): Promise<[any[], number]> {
        const startT = Date.now();
        const stagedRaw = await this.orc.executor.runCommand("git diff --cached --name-only");
        const staged = stagedRaw.stdout.split("\n").filter((f: string) => f.trim() !== "");
        if (staged.length === 0) return [[], startT];

        const changed: Record<string, string> = staged.reduce((acc: any, f: string) => { acc[f] = "staged"; return acc; }, {});
        const active = this.taskOrc.selectActivePhds("Staged Audit", context.identity?.stacks || new Set(["TS", "PY"]), this.orc.personas);
        const findings = await this.taskOrc.runAuditCycle(active, "Staged Audit", changed, context);
        await this.enrichAuditFindings(findings, staged, context);
        return [findings, startT];
    }

    async scan_content(content: string, filename: string): Promise<any[]> {
        if (filename.match(/\.ts$|\.tsx$/)) return (await import("../agents/Support/Analysis/logic_auditor.ts")).LogicAuditor.scanFile(ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true));
        if (filename.endsWith(".md")) return (await import("../agents/Support/Reporting/markdown_auditor.ts")).MarkdownAuditor.auditMarkdown(filename, content);
        return [];
    }

    async scan_multiple_files(files: string[]): Promise<any[]> {
        const findings: any[] = [];
        for (const f of files) {
            if (await Bun.file(this.root.join(f).toString()).exists()) findings.push(...await this.scan_content(await Bun.file(this.root.join(f).toString()).text(), f));
        }
        return findings;
    }

    public async _scan_single_file(f: string, ctx: any): Promise<any[]> { return this.scan_content(await Bun.file(this.root.join(f).toString()).text(), f); }
}
