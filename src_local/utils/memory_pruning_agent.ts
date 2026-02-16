import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "MemoryPruningAgent" });

/**
 * 🧠 Agente de Poda de Memória (Bun Version).
 * Responsável por evitar a inflação de dados e manter o sistema ágil,
 * removendo registros antigos do banco de dados SQLite.
 */
export class MemoryPruningAgent {
    private dbPath: string;

    constructor(projectRoot: string) {
        this.dbPath = new Path(projectRoot).join("system_vault.db").toString();
    }

    /**
     * Remove registros do histórico mais antigos que X dias.
     */
    pruneOldLogs(days: number = 90): void {
        const startT = Date.now();
        logger.info(`🧠 [Pruning] Iniciando limpeza de registros antigos (> ${days} dias)...`);

        try {
            const db = new Database(this.dbPath);

            // Note: date('now') in SQLite returns UTC date.
            const query = db.query(`DELETE FROM health_history WHERE timestamp < datetime('now', '-${days} days')`);
            query.run();

            // Bun:sqlite doesn't have rowcount directly in run() for DELETE, 
            // but we can assume success if no error.

            db.close();

            const duration = (Date.now() - startT) / 1000;
            logger.info(`✨ [Pruning] Database maintenance concluída em ${duration.toFixed(4)}s.`);
        } catch (e) {
            logger.error(`❌ Erro na poda de memória: ${e}`);
        }
    }
}
