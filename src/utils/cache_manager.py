import json
import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CacheManager:
    """Gerenciador de integridade PhD: Monitora mudanças via Hashing."""
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.cache_file = self.project_root / ".gemini" / "cache" / "audit_cache.json"
        self.current_cache = self._load()

    def _load(self):
        if self.cache_file.exists():
            try:
                return json.loads(self.cache_file.read_text(encoding='utf-8'))
            except Exception as e:
                logger.error(f"Erro ao carregar cache: {e}")
        return {}

    def get_file_hash(self, file_path):
        """Gera hash SHA-256 para detecção de mudança."""
        path = Path(file_path)
        if not path.exists():
            return ""
        try:
            sha256_hash = hashlib.sha256()
            with open(path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception as e:
            logger.debug(f"Erro ao gerar hash de {path}: {e}")
            return ""

    def is_changed(self, rel_path, new_hash):
        return self.current_cache.get(str(rel_path)) != new_hash

    def update(self, rel_path, new_hash):
        self.current_cache[str(rel_path)] = new_hash

    def save(self):
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            self.cache_file.write_text(json.dumps(self.current_cache, indent=4), encoding='utf-8')
        except Exception as e:
            logger.error(f"Falha ao salvar cache: {e}")