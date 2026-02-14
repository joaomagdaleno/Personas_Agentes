import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class MemoryPruningAgent:
    """Agente responsável por evitar a inflação de dados e manter o sistema ágil."""
    
    def __init__(self, project_root):
        self.db_path = Path(project_root) / "system_vault.db"

    def prune_old_logs(self, days=90):
        """Remove registros do histórico mais antigos que X dias."""
        import time
        from src_local.utils.logging_config import log_performance
        start_t = time.time()
        
        logger.info(f"🧠 [Pruning] Iniciando limpeza de registros antigos (> {days} dias)...")
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM health_history WHERE timestamp < date('now', '-{days} days')")
            deleted = cursor.rowcount
            conn.commit()
            conn.close()
            if deleted > 0:
                logger.info(f"✨ [Pruning] {deleted} registros comprimidos.")
            
            log_performance(logger, start_t, "🧠 [Pruning] Database maintenance")
        except Exception as e:
            logger.error(f"❌ Erro na poda de memória: {e}")
