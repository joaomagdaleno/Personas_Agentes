import winston from "winston";
import { PhdGovernanceSystem } from "../core/governance/system_facade.ts";

const logger = winston.child({ module: "TaskExecutor" });

/**
 * Utilitário de execução paralela para Bun.
 * Incorpora Back-pressure Dinâmico baseado na Saúde do Hardware da Máquina Host.
 */
export class TaskExecutor {
    private governance: PhdGovernanceSystem;

    /** Parity: constructor - Matches legacy __init__. */
    constructor() {
        this.governance = PhdGovernanceSystem.getInstance();
    }

    /**
     * Executes tasks in parallel using a concurrency-limited pool.
     * Default concurrency: 10
     */
    async runParallel<T, R>(fn: (item: T) => Promise<R> | R, items: T[], concurrency: number = 10): Promise<R[]> {
        if (!items || items.length === 0) return [];

        const results: R[] = new Array(items.length);
        let currentIdx = 0;

        // Ajusta a concorrência baseada na telemetria nativa
        const safeConcurrency = this.governance.getDynamicConcurrency(concurrency);
        if (safeConcurrency < concurrency) {
            logger.warn(`⚠️ [Sovereign Governance] Reduzindo paralelismo de ${concurrency} para ${safeConcurrency} devido a carga no SO.`);
        }

        const worker = async () => {
            while (currentIdx < items.length) {
                const overloadStatus = this.governance.isSystemOverloaded();
                if (overloadStatus.overloaded) {
                    logger.warn(`🛑 [Sovereign Back-pressure] CPU/RAM no limite operativo: ${overloadStatus.reason}. Pausando executor...`);
                    await Bun.sleep(2000); // Back-pressure loop de 2s para alívio do Hardware
                }

                const index = currentIdx++;
                // Check in case currentIdx exceeded length while sleeping
                if (index < items.length) {
                    results[index] = await fn(items[index]!);
                }
            }
        };

        const workers = Array.from({ length: Math.min(safeConcurrency, items.length) }, () => worker());
        await Promise.all(workers);

        return results;
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
