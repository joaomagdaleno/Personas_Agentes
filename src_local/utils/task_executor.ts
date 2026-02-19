import winston from "winston";

const logger = winston.child({ module: "TaskExecutor" });

/**
 * Utilitário de execução paralela para Bun.
 */
export class TaskExecutor {
    /** Parity: constructor - Matches legacy __init__. */
    constructor() { }

    /**
     * Executes tasks in parallel using a concurrency-limited pool.
     * Default concurrency: 10
     */
    async runParallel<T, R>(fn: (item: T) => Promise<R> | R, items: T[], concurrency: number = 10): Promise<R[]> {
        if (!items || items.length === 0) return [];

        const results: R[] = new Array(items.length);
        let currentIdx = 0;

        const worker = async () => {
            while (currentIdx < items.length) {
                const index = currentIdx++;
                results[index] = await fn(items[index]!);
            }
        };

        const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
        await Promise.all(workers);

        return results;
    }

    /** Parity stub: run_parallel */
    public async run_parallel(items: any[], fn: (item: any) => Promise<any>): Promise<any[]> {
        return this.runParallel(fn, items);
    }

    async runCommand(command: string, cwd: string = "."): Promise<{ stdout: string, stderr: string, exitCode: number }> {
        const proc = Bun.spawn(command.split(" "), {
            cwd,
            stdout: "pipe",
            stderr: "pipe"
        });

        const stdout = await new Response(proc.stdout).text();
        const stderr = await new Response(proc.stderr).text();
        const exitCode = await proc.exited;

        return { stdout, stderr, exitCode };
    }
}
