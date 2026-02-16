import winston from "winston";
import { Path } from "./path_utils.ts";
import { TaskOrchestrator } from "./task_orchestrator.ts";
import * as ts from "typescript";

const logger = winston.child({ module: "AuditEngine" });

/**
 * Motor especializado em auditorias estratégicas e scans de integridade (Bun Version).
 */
export class AuditEngine {
    orc: any;
    root: Path;
    taskOrc: TaskOrchestrator;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
        this.root = new Path(orchestrator.projectRoot.toString());
        this.taskOrc = new TaskOrchestrator(orchestrator);
    }

    async runStrategicAudit(context: any, objective: string | null = null, dryRun: boolean = false): Promise<[any[], number]> {
        const startT = Date.now();
        const stacks = context.identity?.stacks || new Set(["Python"]);
        const target = objective || `Validar integridade ${Array.from(stacks).join(', ')}`;

        // Seleção e Detecção
        const active = this.taskOrc.selectActivePhds(target, stacks, this.orc.personas);
        const changedFiles = await this.detectChanges(Object.keys(context.map || {}));
        this.orc.lastDetectedChanges = Object.keys(changedFiles);

        // Execução
        const findings = await this.taskOrc.runAuditCycle(active, target, changedFiles, context);

        // Auditoria Lógica Semântica (Novidade Phd TS)
        for (const filePath of Object.keys(changedFiles)) {
            if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
                const fullPath = this.root.join(filePath);
                const content = await Bun.file(fullPath.toString()).text();
                const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
                const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
                findings.push(...LogicAuditor.scanFile(sourceFile));
            } else if (filePath.endsWith(".md")) {
                const fullPath = this.root.join(filePath);
                const content = await Bun.file(fullPath.toString()).text();
                const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
                findings.push(...MarkdownAuditor.auditMarkdown(filePath, content));
            }
        }

        // 🛡️ Security Audit (Secrets)
        const { SecuritySentinelAgent } = await import("../agents/Support/Security/security_sentinel_agent.ts");
        const security = new SecuritySentinelAgent();
        findings.push(...await security.scanProject(context.map));

        // 📦 Dependency Audit (Submodules)
        const { DependencyAuditor } = await import("../utils/dependency_auditor.ts");
        const auditor = new DependencyAuditor(this.root.toString());
        findings.push(...await auditor.checkSubmoduleStatus());

        // 🧠 Cognitive Audit (Intent)
        const { CognitiveAnalyst } = await import("../agents/Support/Diagnostics/cognitive_analyst.ts");
        for (const filePath of Object.keys(changedFiles)) {
            const fullPath = this.root.join(filePath);
            const content = await Bun.file(fullPath.toString()).text();
            const cognitiveFinding = await CognitiveAnalyst.analyzeIntent(filePath, content, this.orc);
            if (cognitiveFinding) findings.push(cognitiveFinding);
        }

        if (!dryRun) {
            // Persistência Atômica
            for (const [p, h] of Object.entries(changedFiles)) {
                this.orc.cacheManager.update(p, h);
            }
            this.orc.cacheManager.save();
            this.orc.stabilityLedger.update(findings, context.map);
        } else {
            logger.info("🛡️ [AuditEngine] Dry-Run: Persistência de cache e ledger ignorada.");
        }

        return [findings, startT];
    }

    private async detectChanges(mapFiles: string[]): Promise<Record<string, string>> {
        const check = async (p: string) => {
            const fullPath = this.root.join(p);
            const h = await this.orc.cacheManager.getFileHash(fullPath);
            return this.orc.cacheManager.isChanged(p, h) ? { path: p, hash: h } : null;
        };

        const results = await this.orc.executor.runParallel(check, mapFiles);
        const changed: Record<string, string> = {};
        for (const res of results) {
            if (res) changed[res.path] = res.hash;
        }
        return changed;
    }

    async runObfuscationScan(contextMap: any = null): Promise<any[]> {
        const startT = Date.now();
        const { ObfuscationHunter } = await import("../agents/Support/Security/obfuscation_hunter.ts");
        const hunter = new ObfuscationHunter();

        try {
            let findings: any[] = [];
            const tMap = contextMap || this.orc.contextEngine.map;

            for (const [filePath, data] of Object.entries(tMap)) {
                // Support both .py (original target) and .ts (new target)
                if (filePath.endsWith(".ts") || filePath.endsWith(".js") || filePath.endsWith(".py")) {
                    const fullPath = this.root.join(filePath);
                    if (await Bun.file(fullPath.toString()).exists()) {
                        const content = await Bun.file(fullPath.toString()).text();
                        const fileFindings = await hunter.scanFile(filePath, content);
                        findings = findings.concat(fileFindings.map((f: any) => ({ ...f, file: filePath })));
                    }
                }
            }

            const duration = (Date.now() - startT) / 1000;
            logger.info(`🕵️ [AuditEngine] Obfuscation scan concluído em ${duration.toFixed(4)}s. Detectados: ${findings.length}`);
            return findings;
        } catch (e) {
            logger.error(`❌ [AuditEngine] Erro no scan de ofuscação: ${e}`);
            return [];
        }
    }

    async runStagedAudit(context: any, dryRun: boolean = true): Promise<[any[], number]> {
        const startT = Date.now();
        const stacks = context.identity?.stacks || new Set(["TypeScript", "Python"]);
        const target = "Auditoria de Commit (Staged Files)";

        // Get staged files from git
        const stagedRaw = await this.orc.executor.runCommand("git diff --cached --name-only");
        const stagedFilesList = stagedRaw.stdout.split("\n").filter((f: string) => f.trim() !== "");

        if (stagedFilesList.length === 0) {
            logger.info("📦 [AuditEngine] Nenhum arquivo staged para auditar.");
            return [[], startT];
        }

        const active = this.taskOrc.selectActivePhds(target, stacks, this.orc.personas);

        // Build a change map equivalent to what detectChanges produces
        const changedFiles: Record<string, string> = {};
        for (const f of stagedFilesList) {
            changedFiles[f] = "staged"; // Dummy hash for staged mode
        }

        const findings = await this.taskOrc.runAuditCycle(active, target, changedFiles, context);

        // Standard logic for TS/MD files in staged set
        for (const filePath of stagedFilesList) {
            const fullPath = this.root.join(filePath);
            if (!await Bun.file(fullPath.toString()).exists()) continue;

            const content = await Bun.file(fullPath.toString()).text();

            if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
                const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
                const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
                findings.push(...LogicAuditor.scanFile(sourceFile));
            } else if (filePath.endsWith(".md")) {
                const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
                findings.push(...MarkdownAuditor.auditMarkdown(filePath, content));
            }
        }

        return [findings, startT];
    }

    /**
     * 🧠 Scan de Conteúdo em Memória (Legacy Compatibility).
     * Permite auditar strings arbitrárias sem salvar em disco.
     */
    async scan_content(content: string, filename: string): Promise<any[]> {
        if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
            const { LogicAuditor } = await import("../agents/Support/Analysis/logic_auditor.ts");
            const sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
            return LogicAuditor.scanFile(sourceFile);
        } else if (filename.endsWith(".md")) {
            const { MarkdownAuditor } = await import("../agents/Support/Reporting/markdown_auditor.ts");
            return MarkdownAuditor.auditMarkdown(filename, content);
        }
        return [];
    }

    /**
     * 📦 Scan em Lote (Phd Version).
     * Processa múltiplos arquivos com contexto compartilhado.
     */
    async scan_multiple_files(files: string[]): Promise<any[]> {
        const findings: any[] = [];
        const context = this._build_scan_context(files);

        logger.info(`📦 [AuditEngine] Batch Scan iniciado para ${files.length} arquivos.`);

        for (const file of files) {
            const fullPath = this.root.join(file);
            if (await Bun.file(fullPath.toString()).exists()) {
                const content = await Bun.file(fullPath.toString()).text();
                findings.push(...await this.scan_content(content, file));
            }
        }
        return findings;
    }

    private _build_scan_context(files: string[]): any {
        return {
            timestamp: Date.now(),
            files: files,
            mode: "batch",
            phd: "AuditEngine"
        };
    }
}

