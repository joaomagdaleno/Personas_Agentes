"""Agente responsável por persistir e analisar o histórico de saúde do sistema.

Este agente mantém uma base de dados SQLite para armazenar informações sobre o estado de saúde do sistema, incluindo a pontuação, alertas e a média de entropia.
O agente suporta dois tipos de registros: um para cada instância de monitoramento (snapshot) e outro para o histórico de todas as instâncias.
A entropia média é monitorada de forma a aviso se o valor subiu mais do que 10% desde o último registro.

O histórico é atualizado a cada instância de monitoramento, salvando os dados no banco de dados.

A documentação do agente inclui métodos para registrar snapshots e monitorar a entropia média.
"""
import sqlite3
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class HistoryAgent:
    """Agente responsável por persistir e analisar o histórico de saúde do sistema."""
    
    def __init__(self, project_root):
        self.db_path = Path(project_root) / "system_vault.db"
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT UNIQUE,
                name TEXT,
                last_diagnostic DATETIME,
                health_score FLOAT DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS health_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                score FLOAT,
                alerts INTEGER,
                entropy_avg FLOAT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                task_type TEXT,
                target_file TEXT,
                status TEXT DEFAULT 'PENDING',
                result TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                mode TEXT,
                insight TEXT,
                tokens_used INTEGER,
                impact_level TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        conn.commit()
        conn.close()

    def get_setting(self, key, default="false"):
        """Recupera uma configuração do sistema."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.execute("SELECT value FROM system_settings WHERE key=?", (key,))
            row = cursor.fetchone()
            conn.close()
            return row[0] if row else default
        except: return default

    def set_setting(self, key, value):
        """Salva uma configuração."""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)", (key, str(value)))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Erro ao salvar config {key}: {e}")

    def record_insight(self, mode, insight, tokens=0, impact="LOW"):
        """Registra uma descoberta ou otimização feita pela IA."""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("INSERT INTO ai_insights (mode, insight, tokens_used, impact_level) VALUES (?, ?, ?, ?)",
                         (mode, insight, tokens, impact))
            conn.commit()
            conn.close()
            logger.info(f"🧠 [History] Insight de {mode} registrado.")
        except Exception as e:
            logger.error(f"❌ Erro ao salvar insight: {e}")

    def get_overnight_summary(self):
        """Retorna um resumo das atividades das últimas 24 horas de ociosidade."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT insight FROM ai_insights WHERE mode='DEEP' AND timestamp > datetime('now', '-1 day')")
        insights = [row[0] for row in cursor.fetchall()]
        conn.close()
        return insights

    def record_snapshot(self, score, alerts, entropy):
        """Salva um ponto no tempo da saúde sistêmica."""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("INSERT INTO health_history (score, alerts, entropy_avg) VALUES (?, ?, ?)",
                         (score, alerts, entropy))
            conn.commit()
            self._check_entropy_trend(conn, entropy)
            conn.close()
            logger.info(f"📊 [History] Snapshot salvo: Score {score}%")
        except Exception as e:
            logger.error(f"❌ Erro ao salvar histórico: {e}")

    def _check_entropy_trend(self, conn, current_entropy):
        """Avisa se a entropia média subiu mais de 10% desde o último registro."""
        cursor = conn.execute("SELECT entropy_avg FROM health_history ORDER BY timestamp DESC LIMIT 1 OFFSET 1")
        row = cursor.fetchone()
        if row and row[0] > 0:
            last_entropy = row[0]
            growth = (current_entropy - last_entropy) / last_entropy
            if growth > 0.10:
                logger.warning(f"🌡️ [Heatmap] Alerta: A entropia sistêmica cresceu {growth:.1%}! Refatoração recomendada.")

    def generate_trend_data(self):
        """Recupera os últimos 30 registros para plotagem."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute("SELECT score FROM health_history ORDER BY timestamp DESC LIMIT 30")
        data = [row[0] for row in cursor.fetchall()]
        conn.close()
        return data[::-1] # Inverte para ordem cronológica
