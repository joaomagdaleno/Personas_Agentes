import winston from "winston";
import { Path } from "../../../core/path_utils.ts";
import { Database } from "bun:sqlite";
import * as os from "node:os";

const logger = winston.child({ module: "BriefingAgent" });

/**
 * 📰 Agente de Briefing Matinal.
 * Consolida toda a atividade noturna, insights e métricas em um relatório executivo legível.
 */
export class BriefingAgent {
    private projectRoot: Path;
    private dbPath: string;
    private desktopPath: Path;

    constructor(projectRoot: string) {
        this.projectRoot = new Path(projectRoot);
        this.dbPath = this.projectRoot.join("system_vault.db").toString();

        const home = os.homedir();
        this.desktopPath = new Path(home).join("Desktop");
    }

    async generateMorningReport(): Promise<string | null> {
        try {
            const insights = this.getRecentInsights();
            const healthStats = this.getHealthStats();
            const optimizations = this.getOptimizationStats();

            const dateStr = new Date().toISOString().split('T')[0];
            const reportPath = this.desktopPath.join(`Sovereign_Briefing_${dateStr}.md`);

            const content = this.formatReport(insights, healthStats, optimizations);

            await Bun.write(reportPath.toString(), content);
            logger.info(`📰 [Briefing] Relatório matinal gerado em: ${reportPath.toString()}`);
            return reportPath.toString();
        } catch (e) {
            logger.error(`❌ Falha ao gerar briefing: ${e}`);
            return null;
        }
    }

    private getRecentInsights(): any[] {
        try {
            const db = new Database(this.dbPath);
            const query = `
                SELECT mode, insight, impact_level, timestamp 
                FROM ai_insights 
                WHERE timestamp > datetime('now', '-1 day')
                ORDER BY timestamp DESC
            `;
            const data = db.query(query).all();
            db.close();
            return data;
        } catch {
            return [];
        }
    }

    private getHealthStats(): any[] {
        try {
            const db = new Database(this.dbPath);
            const data = db.query("SELECT name, health_score FROM projects").all();
            db.close();
            return data;
        } catch {
            return [];
        }
    }

    private getOptimizationStats(): any {
        try {
            const db = new Database(this.dbPath);
            const killed = db.query("SELECT count(*) as count FROM ai_insights WHERE mode='KILL' AND timestamp > datetime('now', '-1 day')").get() as any;
            db.close();
            return { processes_killed: killed?.count || 0 };
        } catch {
            return { processes_killed: 0 };
        }
    }

    private formatReport(insights: any[], projects: any[], optimizations: any): string {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        const dateStr = now.toLocaleDateString();

        let md = `# 🏛️ Relatório Soberano - ${dateStr}\n\n`;
        md += `> **Gerado às ${timeStr}** | *Status do Sistema: Operacional*\n\n`;

        md += "## 🛡️ Atividade de Defesa & Otimização\n";
        md += `- **Processos Ociosos Encerrados:** ${optimizations.processes_killed}\n`;
        md += `- **Plataforma:** ${os.platform()} ${os.release()}\n\n`;

        md += "## 📡 Saúde dos Territórios (Projetos)\n";
        md += "| Projeto | Saúde Atual | Status |\n|---|---|---|\n";

        for (const p of projects) {
            const score = Math.round(p.health_score || 0);
            const status = score > 80 ? "✅ Estável" : score > 50 ? "⚠️ Atenção" : "🚨 Crítico";
            md += `| **${p.name || 'Unknown'}** | \`${score}%\` | ${status} |\n`;
        }

        md += "\n## 🧠 Sabedoria Noturna (Insights)\n";
        if (insights.length === 0) {
            md += "*Nenhum insight profundo gerado. O sistema pode não ter entrado em modo ocioso prolongado.*\n";
        } else {
            for (const row of insights) {
                const icon = row.mode === "KILL" ? "🧹" : row.mode === "DEEP" ? "💡" : "📝";
                const badge = row.impact_level === "HIGH" ? "**[HIGH]**" : "";
                const time = (row.timestamp || "").substring(11, 16);
                md += `### ${icon} ${time} - ${badge}\n${row.insight}\n\n`;
            }
        }

        md += "---\n*Este relatório foi gerado automaticamente pela sua IA Soberana.*";
        return md;
    }
}
