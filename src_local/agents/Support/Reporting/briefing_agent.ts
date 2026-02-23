import winston from "winston";
import { Path } from "../../../core/path_utils.ts";
import { Database } from "bun:sqlite";
import * as os from "node:os";
import { ProjectSaudeFormatter } from "./ProjectSaudeFormatter.ts";
import { InsightSabedoriaFormatter } from "./InsightSabedoriaFormatter.ts";

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
        const header = `# 🏛️ Relatório Soberano - ${now.toLocaleDateString()}\n\n`;
        const meta = `> **Gerado às ${now.toLocaleTimeString()}** | *Status do Sistema: Operacional*\n\n`;

        let md = header + meta;
        md += "## 🛡️ Atividade de Defesa & Otimização\n";
        md += `- **Processos Ociosos Encerrados:** ${optimizations.processes_killed}\n`;
        md += `- **Plataforma:** ${os.platform()} ${os.release()}\n\n`;

        md += ProjectSaudeFormatter.format(projects);
        md += "\n" + InsightSabedoriaFormatter.format(insights);

        return md + "\n---\n*Este relatório foi gerado automaticamente pela sua IA Soberana.*";
    }
}
