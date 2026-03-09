import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";

const logger = winston.child({ module: "TaskQueue" });

/**
 * Motor de Fila de Tarefas PhD (Proxy para Hub Nativo via gRPC).
 * Gerencia a execução assíncrona delegando para o Hub em Go.
 */
export class TaskQueue {
    private hubManager: HubManagerGRPC;
    private projectRoot: string;

    constructor(projectRoot: string, hubManager?: HubManagerGRPC) {
        this.projectRoot = projectRoot;
        this.hubManager = hubManager || new HubManagerGRPC();
    }

    /**
     * Adiciona uma tarefa à fila se ela não estiver pendente.
     */
    async enqueue(taskType: string, targetFile: string): Promise<boolean> {
        try {
            const success = await this.hubManager.enqueueTask(taskType, targetFile);
            if (success) {
                logger.info(`📥 [Queue] Tarefa agendada via gRPC: ${taskType} -> ${targetFile}`);
                return true;
            }
            return false;
        } catch (e) {
            logger.error(`❌ Erro ao enfileirar tarefa via gRPC: ${e}`);
            return false;
        }
    }

    /**
     * Recupera as próximas tarefas pendentes.
     */
    async getPendingTasks(limit: number = 5): Promise<any[]> {
        try {
            const { response } = await this.hubManager.getPendingTasks(limit);
            return response.tasks;
        } catch (e) {
            logger.error(`❌ Erro ao buscar tarefas via gRPC: ${e}`);
            return [];
        }
    }

    /**
     * Atualiza o status de uma tarefa.
     */
    async updateTaskStatus(taskId: number, status: string, result: string | null = null) {
        try {
            await this.hubManager.updateTask(taskId, status, result || "");
            logger.info(`🔄 [Queue] Tarefa ${taskId} atualizada via gRPC para ${status}`);
        } catch (e) {
            logger.error(`❌ Erro ao atualizar tarefa ${taskId} via gRPC: ${e}`);
        }
    }

    /**
     * Limpa tarefas concluídas ou antigas.
     */
    cleanup() {
        // Agora o Hub gerencia o cleanup internamente se necessário
    }
}
