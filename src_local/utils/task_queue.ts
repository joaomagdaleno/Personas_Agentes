import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "TaskQueue" });

/**
 * Motor de Fila de Tarefas PhD (Bun/SQLite).
 * Gerencia a execução assíncrona de tarefas de documentação e testes.
 */
export class TaskQueue {
    private db: Database;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
    }

    /**
     * Adiciona uma tarefa à fila se ela não estiver pendente.
     */
    enqueue(taskType: string, targetFile: string): boolean {
        try {
            const existing = this.db.query("SELECT id FROM ai_tasks WHERE target_file = ? AND task_type = ? AND status = 'PENDING'")
                .get(targetFile, taskType);

            if (existing) {
                return false;
            }

            this.db.run("INSERT INTO ai_tasks (task_type, target_file) VALUES (?, ?)", [taskType, targetFile]);
            logger.info(`📥 [Queue] Tarefa agendada: ${taskType} -> ${targetFile}`);
            return true;
        } catch (e) {
            logger.error(`❌ Erro ao enfileirar tarefa: ${e}`);
            return false;
        }
    }

    /**
     * Recupera as próximas tarefas pendentes.
     */
    getPendingTasks(limit: number = 5): any[] {
        try {
            return this.db.query("SELECT * FROM ai_tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ?")
                .all(limit);
        } catch (e) {
            logger.error(`❌ Erro ao buscar tarefas: ${e}`);
            return [];
        }
    }

    /**
     * Atualiza o status de uma tarefa.
     */
    updateTaskStatus(taskId: number, status: string, result: string | null = null) {
        try {
            this.db.run("UPDATE ai_tasks SET status = ?, result = ? WHERE id = ?", [status, result, taskId]);
            logger.info(`🔄 [Queue] Tarefa ${taskId} atualizada para ${status}`);
        } catch (e) {
            logger.error(`❌ Erro ao atualizar tarefa ${taskId}: ${e}`);
        }
    }

    /**
     * Limpa tarefas concluídas ou antigas.
     */
    cleanup() {
        try {
            this.db.run("DELETE FROM ai_tasks WHERE status = 'COMPLETED' AND created_at < datetime('now', '-7 days')");
        } catch (e) {
            logger.error(`❌ Erro no cleanup da fila: ${e}`);
        }
    }
}
