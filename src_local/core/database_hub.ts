import { Database } from "bun:sqlite";
import winston from "winston";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
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

    private dbPath: string;

    private static resolveDbPath(projectRoot: string): string {
        if (process.env.PSA_DATABASE_PATH) return process.env.PSA_DATABASE_PATH;
        if (process.env.PSA_DATA_DIR) {
            fs.mkdirSync(process.env.PSA_DATA_DIR, { recursive: true });
            return path.join(process.env.PSA_DATA_DIR, "system_vault.db");
        }

        const candidatePath = new Path(projectRoot).join("system_vault.db").toString();
        try {
            const testFile = path.join(projectRoot, `.w_test_${Date.now()}`);
            fs.writeFileSync(testFile, "1");
            fs.unlinkSync(testFile);
            return candidatePath;
        } catch {
            const fallbackDir = path.join(process.env.LOCALAPPDATA || os.homedir(), "PersonasAgentes", "data");
            fs.mkdirSync(fallbackDir, { recursive: true });
            return path.join(fallbackDir, "system_vault.db");
        }
    }

    private constructor(projectRoot: string) {
        this.dbPath = DatabaseHub.resolveDbPath(projectRoot);
        this.db = new Database(this.dbPath);
        this.db.run("PRAGMA journal_mode = WAL;"); // Melhora performance de concorrência
        this._ensureKVStore();
        logger.info(`🏛️ [DatabaseHub] Conexão estabelecida em: ${this.dbPath}`);
    }

    private _ensureKVStore() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_kv_updated ON kv_store(updated_at);`);
        try {
            this.db.run(`CREATE INDEX IF NOT EXISTS idx_health_history_timestamp ON health_history(timestamp);`);
        } catch {}
    }

    public static getInstance(projectRoot: string): DatabaseHub {
        const targetPath = DatabaseHub.resolveDbPath(projectRoot);
        if (!DatabaseHub.instance || DatabaseHub.instance.dbPath !== targetPath) {
            if (DatabaseHub.instance) {
                DatabaseHub.instance.close();
            }
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

    /**
     * Fecha a conexão com o banco de dados.
     */
    public close(): void {
        try {
            this.db.close();
            DatabaseHub.instance = null;
            logger.info("🏛️ [DatabaseHub] Conexão com o banco de dados encerrada.");
        } catch (e: any) {
            logger.warn(`⚠️ [DatabaseHub] Erro ao fechar banco: ${e.message}`);
        }
    }

    /**
     * 🧹 Suporte ao operador 'using' do TypeScript / Bun (Explicit Resource Management).
     */
    public [Symbol.dispose](): void {
        this.close();
    }

    /**
     * 🧹 Suporte ao operador 'await using' do TypeScript / Bun.
     */
    public async [Symbol.asyncDispose](): Promise<void> {
        this.close();
    }
}
