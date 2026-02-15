import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class MemoryPersistence:
    """Assistente Técnico: Guardião da Memória e Persistência de Dados 💾"""
    
    def __init__(self, storage_path: Path):
        self.path = storage_path

    def load_ledger(self) -> dict:
        """Carrega a memória de longo prazo com segurança."""
        if self.path.exists():
            try:
                return json.loads(self.path.read_text(encoding='utf-8'))
            except Exception as e:
                logger.error(f"Falha ao carregar ledger: {e}")
                return {}
        return {}

    def save_ledger(self, data: dict):
        """Persiste a memória de forma atômica."""
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(data, indent=2), encoding='utf-8')
        except Exception as e:
            logger.error(f"Falha ao salvar ledger: {e}")

    def get_file_metadata(self, ledger: dict, file_path: str) -> dict:
        """Busca histórico específico de um arquivo."""
        return ledger.get(str(file_path), {})
