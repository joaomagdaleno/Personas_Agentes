import winston from "winston";
import { Path } from "./path_utils.ts";
import { TaskOrchestrator } from "./task_orchestrator.ts";
import { AuditHelpers } from "./audit_helpers.ts";
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
        const obj = objective || this._getDefaultObjective(context);
        const active = this.taskOrc.selectActivePhds(obj, this._getStacks(context), this.orc.personas);
        const changed = await this.detectChanges(Object.keys(context.map || {}));
        const findings = await this.taskOrc.runAuditCycle(active, obj, changed, context);

        await this.enrichAuditFindings(findings, Object.keys(changed), context);
        this._handleAuditPersistence(findings, changed, context, dryRun);
        return [findings, startT];
    }

    private _getStacks(ctx: any): Set<string> {
        return ctx.identity?.stacks || new Set(["Python"]);
    }

    private _getDefaultObjective(ctx: any): string {
        return `Validar integridade ${Array.from(this._getStacks(ctx)).join(', ')}`;
    }

    private _handleAuditPersistence(findings: any[], changed: Record<string, string>, ctx: any, dryRun: boolean): void {
        if (!dryRun) this.persistAuditState(findings, changed, ctx);
        else logger.info("🛡️ [AuditEngine] Dry-Run active.");
    }

    private async enrichAuditFindings(findings: any[], changedFiles: string[], context: any): Promise<void> {
        await this._enrichChangedFiles(changedFiles, findings);
        await this._addSecurityFindings(findings, context);
        await this._addDependencyFindings(findings);
    }

    private async _enrichChangedFiles(files: string[], findings: any[]): Promise<void> {
        for (const f of files) {
            await this._enrichSingleFile(f, findings);
        }
    }

    private async _addSecurityFindings(findings: any[], context: any): Promise<void> {
        const security = await (new (await import("../agents/Support/Security/security_sentinel_agent.ts")).SecuritySentinelAgent(this.orc.hubManager)).scanProject(context.map);
        findings.push(...security);
    }

    private async _addDependencyFindings(findings: any[]): Promise<void> {
        const dep = await (new (await import("../utils/dependency_auditor.ts")).DependencyAuditor(this.root.toString())).checkSubmoduleStatus();
        findings.push(...dep);
    }

    private async _enrichSingleFile(f: string, findings: any[]): Promise<void> {
        await AuditHelpers.enrichSingleFile(f, findings, this.root, this.orc);
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
        const startT = Date.now();
        const hunter = new (await import("../agents/Support/Security/obfuscation_hunter.ts")).ObfuscationHunter(this.orc.hubManager);
        const tMap = contextMap || this.orc.contextEngine.map;

        const findings = await this._performObfuscationAudit(tMap, hunter);
        this._logObfuscationTime(startT);
        return findings;
    }

    private async _performObfuscationAudit(tMap: Record<string, any>, hunter: any): Promise<any[]> {
        let findings: any[] = [];
        for (const f of Object.keys(tMap)) {
            findings = findings.concat(await this._scanFileObfuscation(f, hunter));
        }
        return findings;
    }

    private _logObfuscationTime(startT: number): void {
        logger.info(`🕵️ [AuditEngine] Obfuscation scan concluído em ${((Date.now() - startT) / 1000).toFixed(4)}s.`);
    }

    private async _scanFileObfuscation(f: string, hunter: any): Promise<any[]> {
        return AuditHelpers.scanFileObfuscation(f, hunter, this.root);
    }

    async runStagedAudit(context: any, dryRun: boolean = true): Promise<[any[], number]> {
        const startT = Date.now();
        const staged = await this._getStagedFiles();
        if (staged.length === 0) return [[], startT];

        const changed = this._mapStagedToHashes(staged);
        const obj = "Staged Audit";
        const active = this.taskOrc.selectActivePhds(obj, context.identity?.stacks || new Set(["TS", "PY"]), this.orc.personas);
        const findings = await this.taskOrc.runAuditCycle(active, obj, changed, context);

        await this.enrichAuditFindings(findings, staged, context);
        return [findings, startT];
    }

    private async _getStagedFiles(): Promise<string[]> {
        const raw = await this.orc.executor.runCommand("git diff --cached --name-only");
        return raw.stdout.split("\n").filter((f: string) => f.trim() !== "");
    }

    private _mapStagedToHashes(staged: string[]): Record<string, string> {
        return staged.reduce((acc: any, f: string) => { acc[f] = "staged"; return acc; }, {});
    }

    async scan_content(content: string, f: string): Promise<any[]> {
        if (f.match(/\.ts$|\.tsx$/)) return AuditHelpers.scanTs(content, f);
        if (f.endsWith(".md")) return AuditHelpers.scanMd(content, f);
        return [];
    }

    private async _scanTs(content: string, f: string): Promise<any[]> {
        const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
        return LogicAuditor.scanFile(ts.createSourceFile(f, content, ts.ScriptTarget.Latest, true));
    }

    private async _scanMd(content: string, f: string): Promise<any[]> {
        const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
        return MarkdownAuditor.auditMarkdown(f, content);
    }

    async scan_multiple_files(files: string[]): Promise<any[]> {
        const findings: any[] = [];
        for (const f of files) {
            findings.push(...await this._scanOptionalFile(f));
        }
        return findings;
    }

    private async _scanOptionalFile(f: string): Promise<any[]> {
        if (!(await Bun.file(this.root.join(f).toString()).exists())) return [];
        const content = await Bun.file(this.root.join(f).toString()).text();
        return this.scan_content(content, f);
    }

    public async _scan_single_file(f: string, ctx: any): Promise<any[]> { return this.scan_content(await Bun.file(this.root.join(f).toString()).text(), f); }
}
