import winston from "winston";
import { TaskQueue } from "./task_queue.ts";

const logger = winston.child({ module: "TaskWorker" });

/**
 * Operário de Fundo PhD.
 * Consome tarefas da fila (ai_tasks) e executa ações pesadas 
 * (como geração de docs e testes via IA).
 * Recebe TaskQueue diretamente — sem referência ao Orchestrator.
 */
export class TaskWorker {
    private running: boolean = false;

    constructor(private taskQueue: TaskQueue) { }

    /**
     * Inicia o ciclo de processamento em background.
     */
    async start() {
        if (this.running) return;
        this.running = true;
        logger.info("👷 [Worker] Operário de fundo iniciado.");

        while (this.running) {
            try {
                const tasks = await this.taskQueue.getPendingTasks(1);
                if (tasks.length > 0) {
                    await this.processTask(tasks[0]);
                } else {
                    // Espera 30 segundos se a fila estiver vazia
                    await new Promise(resolve => setTimeout(resolve, 30000));
                }
            } catch (e) {
                logger.error(`❌ Erro no ciclo do worker: ${e}`);
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
    }

    stop() {
        this.running = false;
        logger.info("👷 [Worker] Parando operário...");
    }

    private async processTask(task: any) {
        logger.info(`🔨 [Worker] Processando tarefa ${task.id}: ${task.task_type} -> ${task.target_file}`);
        this.taskQueue.updateTaskStatus(task.id, 'RUNNING');

        try {
            if (task.task_type === "DOC_GEN") {
                await this.generateDocumentation(task.target_file);
            } else if (task.task_type === "TEST_GEN") {
                await this.generateTests(task.target_file);
            }

            this.taskQueue.updateTaskStatus(task.id, 'COMPLETED', 'Success');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            logger.error(`🚨 Falha ao processar tarefa ${task.id}: ${msg}`);
            this.taskQueue.updateTaskStatus(task.id, 'FAILED', msg);
        }
    }

    private async generateDocumentation(target: string) {
        // TODO: Integrar com DocGenAgent portado futuramente
        logger.info(`📝 Gerando documentação para ${target}...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula trabalho
    }

    private async generateTests(target: string) {
        // TODO: Integrar com TestArchitectAgent portado futuramente
        logger.info(`🧪 Gerando testes para ${target}...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula trabalho
    }
}
