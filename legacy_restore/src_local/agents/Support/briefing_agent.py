"""
📰 Agente de Briefing Matinal.
Consolida toda a atividade noturna, insights e métricas em um relatório executivo legível.
"""
import logging
import sqlite3
from pathlib import Path
from datetime import datetime
import platform

logger = logging.getLogger(__name__)

class BriefingAgent:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.db_path = self.project_root / "system_vault.db"
        self.desktop_path = Path.home() / "Desktop"

    def generate_morning_report(self):
        """Gera o arquivo Markdown com o resumo das últimas 24h."""
        try:
            insights = self._get_recent_insights()
            health_stats = self._get_health_stats()
            optimizations = self._get_optimization_stats()
            
            report_path = self.desktop_path / f"Sovereign_Briefing_{datetime.now().strftime('%Y-%m-%d')}.md"
            
            content = self._format_report(insights, health_stats, optimizations)
            
            report_path.write_text(content, encoding='utf-8')
            logger.info(f"📰 [Briefing] Relatório matinal gerado em: {report_path}")
            return str(report_path)
        except Exception as e:
            logger.error(f"❌ Falha ao gerar briefing: {e}")
            return None

    def _get_recent_insights(self):
        conn = sqlite3.connect(self.db_path)
        # Pega insights das últimas 24h
        cursor = conn.execute("""
            SELECT mode, insight, impact_level, timestamp 
            FROM ai_insights 
            WHERE timestamp > datetime('now', '-1 day')
            ORDER BY timestamp DESC
        """)
        data = cursor.fetchall()
        conn.close()
        return data

    def _get_health_stats(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT name, health_score FROM projects")
        data = cursor.fetchall()
        conn.close()
        return data

    def _get_optimization_stats(self):
        # Tenta pegar estatísticas de processos mortos (impacto HIGH no log de insights)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("""
            SELECT count(*) FROM ai_insights 
            WHERE mode='KILL' AND timestamp > datetime('now', '-1 day')
        """)
        killed_count = cursor.fetchone()[0]
        conn.close()
        return {"processes_killed": killed_count}

    def _format_report(self, insights, projects, optimizations):
        now = datetime.now().strftime("%H:%M")
        date = datetime.now().strftime("%d/%m/%Y")
        
        md = f"# 🏛️ Relatório Soberano - {date}

"
        md += f"> **Gerado às {now}** | *Status do Sistema: Operacional*

"
        
        md += "## 🛡️ Atividade de Defesa & Otimização
"
        md += f"- **Processos Ociosos Encerrados:** {optimizations['processes_killed']}
"
        md += f"- **Sistema Operacional:** {platform.system()} {platform.release()}

"
        
        md += "## 📡 Saúde dos Territórios (Projetos)
"
        md += "| Projeto | Saúde Atual | Status |
|---|---|---|
"
        for name, score in projects:
            status = "✅ Estável" if score > 80 else "⚠️ Atenção" if score > 50 else "🚨 Crítico"
            md += f"| **{name}** | `{int(score)}%` | {status} |
"
        
        md += "
## 🧠 Sabedoria Noturna (Insights)
"
        if not insights:
            md += "*Nenhum insight profundo gerado. O sistema pode não ter entrado em modo ocioso prolongado.*
"
        else:
            for mode, text, impact, time in insights:
                icon = "🧹" if mode == "KILL" else "💡" if mode == "DEEP" else "📝"
                badge = f"**[{impact}]**" if impact == "HIGH" else ""
                md += f"### {icon} {time[11:16]} - {badge}
{text}

"
        
        md += "---
*Este relatório foi gerado automaticamente pela sua IA Soberana.*"
        return md
