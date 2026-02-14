import winston from "winston";
import { Path } from "./path_utils.ts";
import { TaskOrchestrator } from "./task_orchestrator.ts";

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

    async runStrategicAudit(context: any, objective: string | null = null): Promise<[any[], number]> {
        const startT = Date.now();
        const stacks = context.identity?.stacks || new Set(["Python"]);
        const target = objective || `Validar integridade ${Array.from(stacks).join(', ')}`;

        // Seleção e Detecção
        const active = this.taskOrc.selectActivePhds(target, stacks, this.orc.personas);
        const changedFiles = await this.detectChanges(Object.keys(context.map || {}));
        this.orc.lastDetectedChanges = Object.keys(changedFiles);

        // Execução
        const findings = await this.taskOrc.runAuditCycle(active, target, changedFiles, context);

        // Persistência Atômica
        for (const [p, h] of Object.entries(changedFiles)) {
            this.orc.cacheManager.update(p, h);
        }
        this.orc.cacheManager.save();
        this.orc.stabilityLedger.update(findings, context.map);

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
        const { ObfuscationHunter } = await import("../agents/Support/obfuscation_hunter.ts");
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
                        const fileFindings = hunter.scanFile(filePath, content);
                        findings = findings.concat(fileFindings.map(f => ({ ...f, file: filePath })));
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
}
