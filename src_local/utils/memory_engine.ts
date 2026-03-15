import { Database } from "bun:sqlite";
import winston from "winston";
import { Path } from "../core/path_utils.ts";

const logger = winston.child({ module: "MemoryEngine" });

/**
 * Motor de Memória Cognitiva PhD.
 */
export class MemoryEngine {
    private db: Database;
    private thinkingDepth: number = 7;

    constructor(projectRoot: string) {
        const dbPath = new Path(projectRoot).join("system_vault.db").toString();
        this.db = new Database(dbPath);
    }

    setDepth(level: number) {
        this.thinkingDepth = level;
        logger.info(`🧪 [Memory] Profundidade de pensamento ajustada para: ${level}`);
    }

    rememberFinding(finding: any) {
        try {
            const file = finding.file || "unknown";
            const message = finding.issue || finding.message;
            const severity = finding.severity || "INFO";

            this.db.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["MEMORY", `Finding in ${file}: ${message}`, severity]
            );
            logger.debug(`🧠 [Memory] Memorizado: ${file} (${finding.type || "GENERIC"})`);
        } catch (e) {
            logger.error(`❌ Erro ao memorizar achado: ${e}`);
        }
    }

    public syncProjectMemory(contextMap: Record<string, { content: string, component_type: string }>): void {
        logger.info("🧠 [Memory] Sincronizando memória estrutural...");

        for (const [relPath, data] of Object.entries(contextMap)) {
            this.syncFileMemory(relPath, data.content);
        }
    }

    private syncFileMemory(relPath: string, content: string): void {
        if (!content) return;

        const hash = Bun.hash(content).toString();
        if (this.isMemoryUpToDate(relPath, hash)) return;

        this.updateFileMemory(relPath, content, hash);
    }

    private isMemoryUpToDate(relPath: string, hash: string): boolean {
        const query = "SELECT insight FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?";
        const existing = this.db.query(query).get(`${relPath}:%`);
        return !!existing && (existing as any).insight === `${relPath}:${hash}`;
    }

    private updateFileMemory(relPath: string, content: string, hash: string): void {
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

    private extractAnchors(content: string): string[] {
        const classMatches = content.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        const funcMatches = content.match(/(?:def|function|async\s+function|export\s+const)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];

        const anchors = [...classMatches, ...funcMatches].map(m => m.split(/\s+/).pop()!);
        return [...new Set(anchors)].slice(0, 20);
    }

    searchSimilar(query: string): any[] {
        try {
            const sql = "SELECT * FROM ai_insights WHERE mode IN ('MEMORY', 'RAG') AND insight LIKE ? ORDER BY timestamp DESC LIMIT 5";
            return this.db.query(sql).all(`%${query}%`);
        } catch (e) {
            logger.error(`❌ Erro na busca de memória: ${e}`);
            return [];
        }
    }

    prune() {
        try {
            this.db.run("DELETE FROM ai_insights WHERE mode != 'HASH' AND timestamp < datetime('now', '-30 days')");
        } catch (e) {
            logger.error(`❌ Erro ao podar memória: ${e}`);
        }
    }
}
