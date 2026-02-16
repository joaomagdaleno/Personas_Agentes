import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "MemoryEngine" });

/**
 * Motor de Memória Cognitiva PhD.
 * Armazena e recupera "insights" e "findings" para otimizar 
 * auditorias futuras e evitar análise redundante.
 */
export class MemoryEngine {
    private db: Database;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
    }

    /**
     * Registra um achado na memória de longo prazo.
     */
    rememberFinding(finding: any) {
        try {
            const content = JSON.stringify(finding);
            const file = finding.file || "unknown";
            const type = finding.type || "GENERIC";

            this.db.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["MEMORY", `Finding in ${file}: ${finding.issue || finding.message}`, finding.severity || "INFO"]
            );
            logger.debug(`🧠 [Memory] Memorizado: ${file} (${type})`);
        } catch (e) {
            logger.error(`❌ Erro ao memorizar achado: ${e}`);
        }
    }

    /**
     * Sincroniza a memória do projeto usando hashing incremental (MemoryEngine.py logic).
     */
    public syncProjectMemory(contextMap: Record<string, { content: string, component_type: string }>): void {
        logger.info("🧠 [Memory] Sincronizando memória estrutural...");

        for (const [relPath, data] of Object.entries(contextMap)) {
            const content = data.content;
            if (!content) continue;

            const hash = Bun.hash(content).toString();

            // Verifica se mudou (Simplified check against SQLite)
            const existing = this.db.query("SELECT insight FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?").get(`${relPath}:%`);
            if (existing && (existing as any).insight === `${relPath}:${hash}`) continue;

            // Extrai âncoras estruturais
            const anchors = this.extractAnchors(content);

            this.db.run("DELETE FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?", [`${relPath}:%`]);
            this.db.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["HASH", `${relPath}:${hash}`, "SYSTEM"]
            );

            this.db.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["RAG", `Anchors for ${relPath}: ${anchors.join(", ")}`, "STRATEGIC"]
            );
        }
    }

    /**
     * Extrai âncoras de conhecimento (Classes, Funções) - Mirror of extract_anchors.py
     */
    private extractAnchors(content: string): string[] {
        const classMatches = content.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        const funcMatches = content.match(/(?:def|function|async\s+function|export\s+const)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];

        const anchors = [...classMatches, ...funcMatches].map(m => m.split(/\s+/).pop()!);
        return [...new Set(anchors)].slice(0, 20);
    }

    /**
     * Busca por achados similares no passado.
     */
    searchSimilar(query: string): any[] {
        try {
            // Busca textual simples no SQLite
            return this.db.query("SELECT * FROM ai_insights WHERE mode IN ('MEMORY', 'RAG') AND insight LIKE ? ORDER BY timestamp DESC LIMIT 5")
                .all(`%${query}%`);
        } catch (e) {
            logger.error(`❌ Erro na busca de memória: ${e}`);
            return [];
        }
    }

    /**
     * Limpa memórias obsoletas.
     */
    prune() {
        try {
            this.db.run("DELETE FROM ai_insights WHERE mode != 'HASH' AND timestamp < datetime('now', '-30 days')");
        } catch (e) {
            logger.error(`❌ Erro ao podar memória: ${e}`);
        }
    }
}
