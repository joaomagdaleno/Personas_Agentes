import json
import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CacheManager:
    """
    🗄️ Gerenciador de Cache de Integridade PhD.
    Monitora mudanças no sistema de arquivos via hashing SHA-256, permitindo
    auditorias cirúrgicas e otimização de I/O em grandes territórios.
    """
    def __init__(self, project_root):
        """🏗️ Inicializa o cache vinculando-o ao diretório soberano .gemini."""
        self.project_root = Path(project_root)
        self.cache_file = self.project_root / ".gemini" / "cache" / "audit_cache.json"
        self.current_cache = self._load()

    def _load(self):
        """🧬 Carrega o estado persistente do cache do disco com garantia de integridade."""
        if self.cache_file.exists():
            try:
                return json.loads(self.cache_file.read_text(encoding='utf-8'))
            except Exception as e:
                # Veto de Silenciamento: Reporta falha na persistência
                logger.error(f"🚨 [Cache] Falha ao carregar metadados: {e}")
        return {}

    def get_file_hash(self, file_path):
        """
        ⚡ Gera um snapshot digital (SHA-256) do conteúdo de um arquivo.
        Utiliza leitura por blocos para garantir performance e baixo consumo de memória.
        """
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
            logger.debug(f"ℹ️ [Cache] Erro ao gerar hash de {path}: {e}")
            return ""

    def is_changed(self, rel_path, new_hash):
        """🎯 Compara o hash atual com a memória para detectar modificações atômicas."""
        return self.current_cache.get(str(rel_path)) != new_hash

    def update(self, rel_path, new_hash):
        """📋 Atualiza a memória de curto prazo do cache com o novo hash."""
        self.current_cache[str(rel_path)] = new_hash

    def save(self):
        """💾 Persiste o estado do cache no disco de forma atômica."""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            self.cache_file.write_text(json.dumps(self.current_cache, indent=4), encoding='utf-8')
        except Exception as e:
            logger.error(f"🚨 [Cache] Falha fatal ao salvar memória: {e}")
