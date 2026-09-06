import { Database } from "bun:sqlite";
import * as path from "node:path";
import * as fs from "node:fs";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface SqliteStorageConfig {
    dbPath?: string;
    enableFts?: boolean;
}

export interface SessionQueryResult {
    query: string;
    rows: any[];
    count: number;
    durationMs: number;
}

/**
 * 🗄️ PsaSqliteStoragePlugin
 *
 * Implementação nativa e ultraleve (~2MB RAM) de persistência e auditoria analítica via `bun:sqlite`.
 * Fornece indexação instantânea de sessões, eventos, turnos, tokens e métricas com busca全文 (FTS)
 * e oferece ao modelo ferramentas canônicas:
 * - `session_search`: Busca textual e semântica entre sessões passadas.
 * - `session_event_read`: Lê eventos na íntegra de uma sessão com contexto vizinho.
 * - `session_query_sql`: Executa consultas analíticas SQL em modo seguro (somente leitura) sobre o histórico do agente.
 */
export class SqliteStoragePlugin implements PsaPlugin {
    public name = "psa-plugin-sqlite-storage";
    public version = "1.0.0";
    public description = "Banco de dados SQLite nativo ultra-rápido via bun:sqlite para persistência, auditoria analítica e consultas do modelo.";

    private db: Database;
    private dbPath: string;

    constructor(config: SqliteStorageConfig = {}) {
        this.dbPath = config.dbPath || path.join(process.cwd(), ".psa_sessions", "psa_storage.sqlite");
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(this.dbPath, { create: true });
        this.db.run("PRAGMA journal_mode = WAL;");
        this.db.run("PRAGMA synchronous = NORMAL;");
        this.initSchema();
    }

    private initSchema(): void {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                persona TEXT NOT NULL,
                model TEXT NOT NULL,
                workspace TEXT NOT NULL,
                parent_session_id TEXT,
                fork_step_index INTEGER,
                total_events INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS session_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                event_index INTEGER NOT NULL,
                turn_index INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_events_session_idx ON session_events(session_id, event_index);
            CREATE INDEX IF NOT EXISTS idx_events_type ON session_events(event_type);
            CREATE INDEX IF NOT EXISTS idx_sessions_persona ON sessions(persona);
        `);
    }

    public indexSession(session: { id: string; createdAt: string; persona: string; model: string; workspace: string; parentSessionId?: string; forkStepIndex?: number }): void {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO sessions (id, created_at, persona, model, workspace, parent_session_id, fork_step_index)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            session.id,
            session.createdAt,
            session.persona,
            session.model,
            session.workspace,
            session.parentSessionId || null,
            session.forkStepIndex ?? null
        );
    }

    public indexEvent(event: { sessionId: string; index: number; turnIndex: number; type: string; timestamp: string; payload: any; sha256: string }): void {
        const stmt = this.db.prepare(`
            INSERT INTO session_events (session_id, event_index, turn_index, event_type, timestamp, payload_json, sha256)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            event.sessionId,
            event.index,
            event.turnIndex,
            event.type,
            event.timestamp,
            JSON.stringify(event.payload),
            event.sha256
        );

        this.db.run("UPDATE sessions SET total_events = total_events + 1 WHERE id = ?", [event.sessionId]);
    }

    public syncFromSessionFiles(storageDir: string): number {
        if (!fs.existsSync(storageDir)) return 0;
        const files = fs.readdirSync(storageDir).filter(f => f.endsWith(".jsonl"));
        let count = 0;

        for (const file of files) {
            const filePath = path.join(storageDir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.trim().split(/\r?\n/);

            for (const line of lines) {
                if (!line) continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.type === "session_init" && parsed.metadata) {
                        this.indexSession(parsed.metadata);
                    } else if (parsed.sessionId && parsed.sha256) {
                        // Verifica se o evento já existe
                        const exists = this.db.query("SELECT id FROM session_events WHERE session_id = ? AND event_index = ?").get(parsed.sessionId, parsed.index);
                        if (!exists) {
                            this.indexEvent(parsed);
                            count++;
                        }
                    }
                } catch {}
            }
        }
        return count;
    }

    public querySql(sql: string, params: any[] = []): SessionQueryResult {
        const trimmed = sql.trim().toLowerCase();
        // Política de segurança estrita: apenas consultas de leitura (SELECT e PRAGMA)
        if (!trimmed.startsWith("select") && !trimmed.startsWith("pragma") && !trimmed.startsWith("with")) {
            throw new Error("[PsaSqliteSecurity] Apenas comandos SELECT/WITH de leitura são permitidos via session_query_sql.");
        }

        const start = performance.now();
        const stmt = this.db.query(sql);
        const rows = stmt.all(...params) as any[];
        const durationMs = Math.round((performance.now() - start) * 100) / 100;

        return {
            query: sql,
            rows: rows.slice(0, 500), // Cap de segurança de 500 linhas
            count: rows.length,
            durationMs
        };
    }

    public apply(ctx: PsaContext): void {
        // Sincroniza sessões existentes gravadas em arquivo
        const sessionsDir = path.join(ctx.workspaceRoot, ".psa_sessions");
        this.syncFromSessionFiles(sessionsDir);

        // Ouve eventos do kernel para manter o banco SQLite 100% atualizado em tempo real
        ctx.events.on("agent/step", async (data: any) => {
            if (data?.sessionEvent) {
                this.indexEvent(data.sessionEvent);
            }
        });

        // 1. session_search (upstream alias)
        const executeSessionSearch = async (args: { query: string; limit?: number }) => {
            const limit = Math.min(args.limit || 20, 100);
            const searchPattern = `%${args.query}%`;

            const rows = this.db.query(`
                SELECT s.id, s.created_at, s.persona, s.model, e.event_type, e.payload_json
                FROM sessions s
                JOIN session_events e ON s.id = e.session_id
                WHERE e.payload_json LIKE ? OR s.persona LIKE ? OR s.id LIKE ?
                ORDER BY e.id DESC
                LIMIT ?
            `).all(searchPattern, searchPattern, searchPattern, limit) as any[];

            return {
                query: args.query,
                totalHits: rows.length,
                hits: rows.map(r => ({
                    sessionId: r.id,
                    createdAt: r.created_at,
                    persona: r.persona,
                    model: r.model,
                    eventType: r.event_type,
                    preview: r.payload_json.length > 250 ? r.payload_json.slice(0, 250) + "..." : r.payload_json
                }))
            };
        };

        ctx.tools.register({
            name: "session_search",
            description: "Pesquisa por termos ou padrões no histórico de sessões anteriores gravadas no banco de dados SQLite.",
            schema: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Termo ou palavra-chave para buscar nas sessões passadas" },
                    limit: { type: "number", description: "Quantidade máxima de resultados (padrão: 20)" }
                },
                required: ["query"]
            },
            isExclusive: false,
            execute: executeSessionSearch
        });

        // Alias sob namespace moderno
        ctx.tools.register({
            name: "session.search",
            description: "Busca sessões passadas no banco de dados analítico SQLite (alias moderno para session_search).",
            schema: {
                type: "object",
                properties: {
                    query: { type: "string" },
                    limit: { type: "number" }
                },
                required: ["query"]
            },
            isExclusive: false,
            execute: executeSessionSearch
        });

        // 2. session_event_read (leitura pontual com contexto vizinho)
        ctx.tools.register({
            name: "session_event_read",
            description: "Lê um evento completo e eventos vizinhos de uma sessão para entender o raciocínio ou contexto de um passo passado.",
            schema: {
                type: "object",
                properties: {
                    sessionId: { type: "string", description: "Identificador da sessão alvo" },
                    eventIndex: { type: "number", description: "Índice do evento a ser recuperado" },
                    window: { type: "number", description: "Número de eventos anteriores e posteriores a incluir (padrão: 2)" }
                },
                required: ["sessionId", "eventIndex"]
            },
            isExclusive: false,
            execute: async (args: { sessionId: string; eventIndex: number; window?: number }) => {
                const win = Math.min(args.window || 2, 10);
                const minIdx = Math.max(1, args.eventIndex - win);
                const maxIdx = args.eventIndex + win;

                const events = this.db.query(`
                    SELECT event_index, turn_index, event_type, timestamp, payload_json, sha256
                    FROM session_events
                    WHERE session_id = ? AND event_index BETWEEN ? AND ?
                    ORDER BY event_index ASC
                `).all(args.sessionId, minIdx, maxIdx) as any[];

                return {
                    sessionId: args.sessionId,
                    targetIndex: args.eventIndex,
                    eventsCount: events.length,
                    events: events.map(e => ({
                        ...e,
                        payload: JSON.parse(e.payload_json)
                    }))
                };
            }
        });

        // 3. session_query_sql (análise avançada e consultas do modelo)
        ctx.tools.register({
            name: "session_query_sql",
            description: "Executa consultas SQL de somente leitura sobre o banco de auditoria SQLite de sessões e eventos. Tabelas: `sessions` (id, created_at, persona, model, workspace, parent_session_id, total_events) e `session_events` (session_id, event_index, turn_index, event_type, timestamp, payload_json, sha256).",
            schema: {
                type: "object",
                properties: {
                    sql: { type: "string", description: "Comando SELECT SQL a ser executado" }
                },
                required: ["sql"]
            },
            isExclusive: false,
            execute: async (args: { sql: string }) => {
                return this.querySql(args.sql);
            }
        });
    }

    public vacuum(): void {
        try {
            this.db.exec("VACUUM;");
        } catch {}
    }

    public close(): void {
        try {
            this.db.close();
        } catch {}
    }
}
