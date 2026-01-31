import json
import os
import hashlib

class CacheManager:
    """
    Gerenciador de Cache de Auditoria.
    Garante que arquivos não modificados não sejam re-processados.
    """
    def __init__(self, project_root):
        self.cache_dir = os.path.join(project_root, ".gemini", "cache")
        self.cache_file = os.path.join(self.cache_dir, "audit_cache.json")
        self.current_cache = self._load_cache()
        os.makedirs(self.cache_dir, exist_ok=True)

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def get_file_hash(self, file_path):
        """Gera um hash SHA-256 do conteúdo do arquivo."""
        hasher = hashlib.sha256()
        try:
            with open(file_path, 'rb') as f:
                buf = f.read()
                hasher.update(buf)
            return hasher.hexdigest()
        except:
            return None

    def is_changed(self, rel_path, current_hash):
        """Verifica se o arquivo mudou desde a última auditoria."""
        return self.current_cache.get(rel_path) != current_hash

    def update(self, rel_path, current_hash):
        self.current_cache[rel_path] = current_hash

    def save(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.current_cache, f)
