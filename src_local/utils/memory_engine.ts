import winston from "winston";
import { HubManagerGRPC } from "../core/hub_manager_grpc.ts";
import { DatabaseHub } from "../core/database_hub.ts";

const logger = winston.child({ module: "MemoryEngine" });

/**
 * Motor de Memória Cognitiva PhD.
 */
export class MemoryEngine {
    private dbHub: DatabaseHub;
    private thinkingDepth: number = 7;

    constructor(projectRoot: string, private hubManager?: HubManagerGRPC) {
        this.dbHub = DatabaseHub.getInstance(projectRoot);
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

            this.dbHub.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["MEMORY", `Finding in ${file}: ${message}`, severity]
            );
            logger.debug(`🧠 [Memory] Memorizado: ${file} (${finding.type || "GENERIC"})`);
        } catch (e) {
            logger.error(`❌ Erro ao memorizar achado: ${e}`);
        }
    }

    public async syncProjectMemory(contextMap: Record<string, { content: string, component_type: string }>): Promise<void> {
        logger.info("🧠 [Memory] Sincronizando memória estrutural...");

        const tasks: Promise<void>[] = [];
        for (const [relPath, data] of Object.entries(contextMap)) {
            tasks.push(this.syncFileMemory(relPath, data.content));
        }
        await Promise.all(tasks);
    }

    private async syncFileMemory(relPath: string, content: string): Promise<void> {
        if (!content) return;

        const hash = Bun.hash(content).toString();
        if (this.isMemoryUpToDate(relPath, hash)) return;

        await this.updateFileMemory(relPath, content, hash);
    }

    private isMemoryUpToDate(relPath: string, hash: string): boolean {
        const query = "SELECT insight FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?";
        const existing = this.dbHub.query(query).get(`${relPath}:%`);
        return !!existing && (existing as any).insight === `${relPath}:${hash}`;
    }

    private async updateFileMemory(relPath: string, content: string, hash: string): Promise<void> {
        let anchors: string[] = [];
        
        if (this.hubManager) {
            try {
                const analysis = await this.hubManager.analyzeFile(relPath, content);
                if (analysis && analysis.symbols) {
                    anchors = analysis.symbols.map((s: any) => `${s.kind}:${s.name}`);
                }
            } catch (e) {
                logger.error(`❌ [Memory] Erro ao extrair âncoras via Hub para ${relPath}: ${e}`);
            }
        }

        // Se o Hub falhar ou não estiver disponível, não usamos fallback de Regex (Soberania de Qualidade)
        if (anchors.length === 0) {
            logger.debug(`⚠️ [Memory] Sem âncoras extraídas para ${relPath}.`);
        }

        this.dbHub.run("DELETE FROM ai_insights WHERE mode = 'HASH' AND insight LIKE ?", [`${relPath}:%`]);
        this.dbHub.run(
            "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
            ["HASH", `${relPath}:${hash}`, "SYSTEM"]
        );

        if (anchors.length > 0) {
            this.dbHub.run(
                "INSERT INTO ai_insights (mode, insight, impact_level) VALUES (?, ?, ?)",
                ["RAG", `Anchors for ${relPath}: ${anchors.join(", ")}`, "STRATEGIC"]
            );
        }
    }

    searchSimilar(query: string): any[] {
        try {
            const sql = "SELECT * FROM ai_insights WHERE mode IN ('MEMORY', 'RAG') AND insight LIKE ? ORDER BY timestamp DESC LIMIT 5";
            return this.dbHub.query(sql).all(`%${query}%`);
        } catch (e) {
            logger.error(`❌ Erro na busca de memória: ${e}`);
            return [];
        }
    }

    prune() {
        try {
            this.dbHub.run("DELETE FROM ai_insights WHERE mode != 'HASH' AND timestamp < datetime('now', '-30 days')");
        } catch (e) {
            logger.error(`❌ Erro ao podar memória: ${e}`);
        }
    }
}
