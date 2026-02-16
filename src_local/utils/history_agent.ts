import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "HistoryAgent" });

/**
 * Agente responsável por persistir e analisar o histórico de saúde do sistema (Bun/SQLite Version).
 */
export class HistoryAgent {
    private db: Database;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
        this.initDb();
    }

    private initDb() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE,
                name TEXT,
                last_diagnostic DATETIME,
                health_score FLOAT DEFAULT 0
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS health_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                score FLOAT,
                alerts INTEGER,
                entropy_avg FLOAT,
                breakdown_json TEXT
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS ai_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                task_type TEXT,
                target_file TEXT,
                status TEXT DEFAULT 'PENDING',
                result TEXT
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS ai_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                mode TEXT,
                insight TEXT,
                tokens_used INTEGER,
                impact_level TEXT
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS user_activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                app_name TEXT,
                category TEXT,
                duration_seconds INTEGER
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS memory_baseline (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                ram_percent FLOAT,
                is_idle BOOLEAN
            )
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
    }

    getSetting(key: string, defaultValue: string = "false"): string {
        const query = this.db.query("SELECT value FROM system_settings WHERE key = ?");
        const row = query.get(key) as { value: string } | null;
        return row ? row.value : defaultValue;
    }

    setSetting(key: string, value: any) {
        try {
            this.db.run("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)", [key, String(value)]);
        } catch (e) {
            logger.error(`❌ Erro ao salvar config ${key}: ${e}`);
        }
    }

    recordInsight(mode: string, insight: string, tokens: number = 0, impact: string = "LOW") {
        try {
            this.db.run("INSERT INTO ai_insights (mode, insight, tokens_used, impact_level) VALUES (?, ?, ?, ?)",
                [mode, insight, tokens, impact]);
            logger.info(`🧠 [History] Insight de ${mode} registrado.`);
        } catch (e) {
            logger.error(`❌ Erro ao salvar insight: ${e}`);
        }
    }

    recordSnapshot(score: number, alerts: number, entropy: number, breakdown: any = null) {
        try {
            const bJson = breakdown ? JSON.stringify(breakdown) : null;
            this.db.run("INSERT INTO health_history (score, alerts, entropy_avg, breakdown_json) VALUES (?, ?, ?, ?)",
                [score, alerts, entropy, bJson]);
            this.checkEntropyTrend(entropy);
            logger.info(`📊 [History] Snapshot salvo: Score ${score}%`);
        } catch (e) {
            logger.error(`❌ Erro ao salvar histórico: ${e}`);
        }
    }

    private checkEntropyTrend(currentEntropy: number) {
        const query = this.db.query("SELECT entropy_avg FROM health_history ORDER BY timestamp DESC LIMIT 1 OFFSET 1");
        const row = query.get() as { entropy_avg: number } | null;
        if (row && row.entropy_avg > 0) {
            const growth = (currentEntropy - row.entropy_avg) / row.entropy_avg;
            if (growth > 0.10) {
                logger.warn(`🌡️ [Heatmap] Alerta: A entropia sistêmica cresceu ${(growth * 100).toFixed(1)}%! Refatoração recomendada.`);
            }
        }
    }

    generateTrendData(): number[] {
        const query = this.db.query("SELECT score FROM health_history ORDER BY timestamp DESC LIMIT 30");
        const rows = query.all() as { score: number }[];
        return rows.map(r => r.score).reverse();
    }
}
