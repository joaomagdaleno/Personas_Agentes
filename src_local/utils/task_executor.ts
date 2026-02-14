import winston from "winston";

const logger = winston.child({ module: "TaskExecutor" });

/**
 * Utilitário de execução paralela para Bun.
 */
export class TaskExecutor {
    /**
     * Executes tasks in parallel using Promise.all.
     * Concurrency is currently unlimited but could be throttled.
     */
    async runParallel<T, R>(fn: (item: T) => Promise<R> | R, items: T[]): Promise<R[]> {
        if (!items || items.length === 0) return [];
        return await Promise.all(items.map(item => fn(item)));
    }
}
