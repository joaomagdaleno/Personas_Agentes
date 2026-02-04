import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ConflictPolicyPhd:
    """🛡️ Políticas de Conflito PhD: Especialista em Resolução."""
    
    def __init__(self, root, git_runner):
        self.root = Path(root)
        self.git_runner = git_runner

    def resolve_file(self, f, merge_skills_index_fn, is_protected_fn):
        """Resolve conflito baseado no tipo e proteção do arquivo."""
        if "__pycache__" in f or f.endswith(".pyc"):
            return self._resolve_cache(f)
        
        if f == "skills_index.json":
            return self._resolve_json(f, merge_skills_index_fn)

        if is_protected_fn(f):
            return self._resolve_ours(f, "Protegendo local")
        
        return self._resolve_theirs(f, "Priorizando upstream")

    def _resolve_cache(self, f):
        logger.info(f"🗑️ Limpando cache: {f}")
        self.git_runner(["rm", "--cached", f])
        full_path = self.root / f
        if full_path.exists():
            try: os.remove(full_path)
            except: pass
        return True

    def _resolve_json(self, f, merge_fn):
        if merge_fn(f):
            self.git_runner(["add", f])
            return True
        return self._resolve_ours(f, "Falha no merge JSON")

    def _resolve_ours(self, f, reason):
        logger.info(f"🛡️ {reason}: {f}")
        self.git_runner(["checkout", "--ours", f])
        self.git_runner(["add", f])
        return True

    def _resolve_theirs(self, f, reason):
        logger.info(f"📡 {reason}: {f}")
        self.git_runner(["checkout", "--theirs", f])
        self.git_runner(["add", f])
        return True
