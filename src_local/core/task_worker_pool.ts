import winston from "winston";
import { eventBus } from "./event_bus.ts";

const logger = winston.child({ module: "TaskWorkerPool" });

export interface WorkerTask<T = any> {
    id: string;
    type: string;
    payload: T;
    priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    created_at: number;
}

export class TaskWorkerPool {
    private queue: WorkerTask[] = [];
    private activeWorkers: number = 0;
    private maxConcurrency: number;
    private isRunning: boolean = false;

    constructor(maxConcurrency: number = 4) {
        this.maxConcurrency = maxConcurrency;
    }

    public enqueue(task: Omit<WorkerTask, "created_at">): void {
        const fullTask: WorkerTask = { ...task, created_at: Date.now() };
        
        // Evitar duplicatas em fila para a mesma tarefa
        if (this.queue.some(t => t.id === fullTask.id)) {
            return;
        }

        if (fullTask.priority === "CRITICAL") {
            this.queue.unshift(fullTask);
        } else {
            this.queue.push(fullTask);
        }

        logger.info(`📥 [TaskWorkerPool] Tarefa enfileirada: ${fullTask.id} (${fullTask.type}) - Fila: ${this.queue.length}`);
        this.processNext();
    }

    public start(): void {
        this.isRunning = true;
        logger.info(`🚀 [TaskWorkerPool] Worker Pool iniciado (Concorrência máx: ${this.maxConcurrency})`);
        this.processNext();
    }

    public stop(): void {
        this.isRunning = false;
        logger.info("🛑 [TaskWorkerPool] Worker Pool pausado.");
    }

    private async processNext(): Promise<void> {
        if (!this.isRunning || this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        if (!task) return;

        this.activeWorkers++;
        const startTime = Date.now();

        try {
            logger.info(`⚡ [TaskWorkerPool] Executando tarefa: ${task.id} (${task.type})`);
            
            // Disparar execução reativa baseada no tipo de tarefa
            await this.executeTask(task);
            
            const duration = Date.now() - startTime;
            logger.info(`✅ [TaskWorkerPool] Tarefa concluída: ${task.id} em ${duration}ms`);
            eventBus.emit("task:completed" as any, { taskId: task.id, result: `Concluída em ${duration}ms` });
        } catch (error: any) {
            logger.error(`❌ [TaskWorkerPool] Falha na tarefa ${task.id}: ${error.message}`);
            eventBus.emit("task:failed" as any, { taskId: task.id, error: error.message });
        } finally {
            this.activeWorkers--;
            this.processNext();
        }
    }

    private async executeTask(task: WorkerTask): Promise<void> {
        switch (task.type) {
            case "audit_file": {
                const { AuditHelpers } = await import("./audit_helpers.ts");
                const { Path } = await import("./path_utils.ts");
                const root = new Path(process.cwd());
                const findings: any[] = [];
                await AuditHelpers.enrichSingleFile(task.payload.file, findings, root, { hubManager: undefined });
                if (findings.length > 0) {
                    eventBus.emit("audit:findings" as any, { findings });
                }
                break;
            }
            case "vacuum_db": {
                const { DatabaseHub } = await import("./database_hub.ts");
                const db = DatabaseHub.getInstance(process.cwd());
                db.run("VACUUM;");
                break;
            }
            default:
                await new Promise(resolve => setTimeout(resolve, 50));
                break;
        }
    }

    public getStatus(): { queueLength: number; activeWorkers: number; isRunning: boolean } {
        return {
            queueLength: this.queue.length,
            activeWorkers: this.activeWorkers,
            isRunning: this.isRunning
        };
    }
}
