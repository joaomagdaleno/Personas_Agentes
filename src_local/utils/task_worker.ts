import winston from "winston";
import { TaskQueue } from "./task_queue.ts";
import { eventBus } from "../core/event_bus.ts";

import { PhdGovernanceSystem } from "../core/governance/system_facade.ts";

const logger = winston.child({ module: "TaskWorker" });

/**
 * Operário de Fundo PhD.
 * Consome tarefas da fila (ai_tasks) e executa ações pesadas 
 * (como geração de docs e testes via IA).
 * Recebe TaskQueue diretamente — sem referência ao Orchestrator.
 */
export class TaskWorker {
    private running: boolean = false;
    private paused: boolean = false;
    private maxConcurrentTasks: number = 5;
    private currentTasks: number = 0;
    private governance: PhdGovernanceSystem;

    constructor(private taskQueue: TaskQueue, private orc?: any) {
        this.governance = PhdGovernanceSystem.getInstance();
        this.registerEvents();
    }

    private registerEvents() {
        eventBus.on("system:halt-experimentation", () => {
            if (!this.paused) {
                this.paused = true;
                logger.warn("🛑 [Worker] Pausando execução de tarefas devido a alerta sistêmico.");
            }
        });

        eventBus.on("system:health-check", ({ score }) => {
            if (this.paused && score > 60) {
                this.paused = false;
                logger.info("🟢 [Worker] Resumindo execução (Saúde restaurada).");
            }
        });
    }

    /**
     * Inicia o ciclo de processamento em background.
     */
    async start() {
        if (this.running) return;
        this.running = true;
        logger.info(`👷 [Worker] Operário de fundo iniciado (Paralelismo: ${this.maxConcurrentTasks}).`);

        while (this.running) {
            try {
                if (this.paused) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }

                // Ajuste Dinâmico de Paralelismo baseado no Hardware
                const limit = this.governance.getDynamicConcurrency(this.maxConcurrentTasks);
                if (limit < this.maxConcurrentTasks) {
                    logger.warn(`🐌 [Worker] Throttle ativado: Limitando tarefas para ${limit} devido a carga no SO.`);
                }

                // Se ainda temos "slots" livres, buscamos mais tarefas
                if (this.currentTasks < limit) {
                    const tasks = await this.taskQueue.getPendingTasks(limit - this.currentTasks);
                    
                    if (tasks.length > 0) {
                        for (const task of tasks) {
                            // Dispara sem dar await (paralelismo)
                            this.runTask(task);
                        }
                    }
                }
                
                // Back-pressure: se o sistema estiver sobrecarregado, espera mais tempo
                const overload = this.governance.isSystemOverloaded();
                const waitTime = overload.overloaded ? 10000 : 2000;
                if (overload.overloaded) {
                    logger.warn(`🛑 [Worker] Back-pressure intenso: Sistema sobrecarregado (${overload.reason}). Pausando 10s.`);
                }

                await new Promise(resolve => setTimeout(resolve, waitTime));
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                logger.error(`❌ Erro no ciclo do worker: ${msg}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    private async runTask(task: any) {
        this.currentTasks++;
        try {
            await this.processTask(task);
        } finally {
            this.currentTasks--;
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
            if (!this.orc) {
                throw new Error("Orchestrator não injetado no TaskWorker.");
            }

            switch (task.task_type) {
                case "DOC_GEN":
                    await this.generateDocumentation(task.target_file);
                    break;

                // Pirâmide de Testes Industrial (Google 80/15/5)
                case "TEST_GEN":
                case "UNIT_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada UNIT (80%) -> ${task.target_file}`);
                    await this.orc.generateTests(task.target_file);
                    break;

                case "INTEGRATION_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada INTEGRATION (15%) -> ${task.target_file}`);
                    // target_file can be "fileA.ts|fileB.ts" for pairs
                    const [fileA, fileB] = task.target_file.split('|');
                    await this.orc.generateIntegrationTest(fileA, fileB || fileA);
                    break;

                case "E2E_TEST_GEN":
                    logger.info(`📐 [Pyramid] Camada E2E (5%) -> ${task.target_file}`);
                    await this.orc.generateE2ETest(task.target_file);
                    break;

                default:
                    logger.warn(`⚠️ Tipo de tarefa desconhecido: ${task.task_type}`);
            }

            this.taskQueue.updateTaskStatus(task.id, 'COMPLETED', 'Success');
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            logger.error(`🚨 Falha ao processar tarefa ${task.id}: ${msg}`);
            this.taskQueue.updateTaskStatus(task.id, 'FAILED', msg);
        }
    }

    private async generateDocumentation(target: string) {
        logger.info(`📝 [Worker] Gerando documentação PhD para ${target}...`);
        await this.orc.generateDocumentation(target);
    }
}
