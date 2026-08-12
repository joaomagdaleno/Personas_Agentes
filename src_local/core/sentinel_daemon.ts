import { watch } from "node:fs";
import winston from "winston";
import { eventBus } from "./event_bus.ts";
import { TaskWorkerPool } from "./task_worker_pool.ts";
import { Path } from "./path_utils.ts";

const logger = winston.child({ module: "SentinelDaemon" });

export class SentinelDaemon {
    private workerPool: TaskWorkerPool;
    private watcher: any = null;
    private isRunning: boolean = false;
    private projectRoot: Path;

    constructor(projectRoot: string = process.cwd(), concurrency: number = 4) {
        this.projectRoot = new Path(projectRoot);
        this.workerPool = new TaskWorkerPool(concurrency);
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.workerPool.start();

        logger.info(`🛡️ [SentinelDaemon] Sentinela Autônomo Iniciado em: ${this.projectRoot.toString()}`);
        logger.info("👀 [SentinelDaemon] Escutando alterações de código em tempo real...");

        try {
            this.watcher = watch(this.projectRoot.toString(), { recursive: true }, (eventType, filename) => {
                if (!filename) return;

                const normFile = filename.replace(/\\/g, "/");
                if (this.shouldIgnore(normFile)) return;

                logger.info(`✨ [SentinelDaemon] Alteração em tempo real detectada: ${normFile} (${eventType})`);
                
                // Enfileirar auditoria reativa instantânea
                this.workerPool.enqueue({
                    id: `audit_${normFile}_${Date.now()}`,
                    type: "audit_file",
                    payload: { file: normFile },
                    priority: "HIGH"
                });
            });
        } catch (e: any) {
            logger.error(`🚨 [SentinelDaemon] Falha ao iniciar watcher: ${e.message}`);
        }
    }

    public stop(): void {
        if (!this.isRunning) return;
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        this.workerPool.stop();
        this.isRunning = false;
        logger.info("🛑 [SentinelDaemon] Sentinela Autônomo encerrado.");
    }

    private shouldIgnore(file: string): boolean {
        const ignoreList = [
            "node_modules",
            ".git",
            "system_vault.db",
            "diagnostic.log",
            "test_output.log",
            ".sovereign_cache",
            "dist",
            "build"
        ];
        return ignoreList.some(pat => file.includes(pat));
    }

    public getStatus() {
        return {
            isRunning: this.isRunning,
            poolStatus: this.workerPool.getStatus()
        };
    }
}
