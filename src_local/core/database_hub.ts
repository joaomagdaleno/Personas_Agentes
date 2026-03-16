import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "./path_utils.ts";

const logger = winston.child({ module: "DatabaseHub" });

/**
 * 🏛️ DatabaseHub Singleton.
 * Centraliza o acesso ao SQLite e gerencia retentativas para evitar 'database is locked'.
 */
export class DatabaseHub {
    private static instance: DatabaseHub | null = null;
    private db: Database;
    private maxRetries = 5;
    private retryDelayMs = 100;

    private constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
        this.db.run("PRAGMA journal_mode = WAL;"); // Melhora performance de concorrência
        this._ensureKVStore();
        logger.info(`🏛️ [DatabaseHub] Conexão estabelecida em: ${dbPath}`);
    }

    private _ensureKVStore() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public static getInstance(projectRoot: string): DatabaseHub {
        if (!DatabaseHub.instance) {
            DatabaseHub.instance = new DatabaseHub(projectRoot);
        }
        return DatabaseHub.instance;
    }

    /**
     * Define um valor no store genérico.
     */
    public async set(key: string, value: string): Promise<void> {
        await this.execute((db) => {
            db.run("INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
        });
    }

    /**
     * Obtém um valor do store genérico.
     */
    public async get(key: string): Promise<string | null> {
        return await this.execute((db) => {
            const row = db.query("SELECT value FROM kv_store WHERE key = ?").get(key) as { value: string } | null;
            return row ? row.value : null;
        });
    }

    /**
     * Executa uma operação com lógica de retry automático para bloqueios.
     */
    public async execute<T>(operation: (db: Database) => T): Promise<T> {
        let lastError: any;
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return operation(this.db);
            } catch (e: any) {
                lastError = e;
                if (e.message?.includes("database is locked")) {
                    const delay = this.retryDelayMs * Math.pow(2, i);
                    logger.warn(`⏳ [DatabaseHub] Banco travado, tentando novamente em ${delay}ms... (Tentativa ${i + 1}/${this.maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw e;
            }
        }
        logger.error(`🚨 [DatabaseHub] Falha persistente após ${this.maxRetries} tentativas: ${lastError.message}`);
        throw lastError;
    }

    /**
     * Helper para queries simples.
     */
    public query(sql: string) {
        return this.db.query(sql);
    }

    /**
     * Helper para execução simples de comandos.
     */
    public run(sql: string, params: any[] = []) {
        return this.execute((db) => db.run(sql, params));
    }
}
