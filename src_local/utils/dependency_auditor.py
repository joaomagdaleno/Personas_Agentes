import subprocess
import logging
import time
import ast
from pathlib import Path
from src_local.utils.logging_config import log_performance

logger = logging.getLogger("BulletProofSync_v9")

class DependencyAuditor:
    """
    📦 Auditor de Dependências Soberano v9.
    Gerencia a integridade e sincronização de submódulos (.agent/skills),
    garantindo resiliência total a conflitos e falhas de rede.
    """
    
    def __init__(self, project_root):
        """🏗️ Inicializa o auditor vinculando-o à raiz do projeto alvo."""
        from src_local.utils.git_client import GitClient
        from src_local.utils.submodule_sync_logic import SubmoduleSyncLogic
        self.project_root = Path(project_root)
        self.agent_path = self.project_root / ".agent" / "skills"
        self.lock_file = self.project_root / ".gemini" / "sync.lock"
        self.is_internal = "Personas_Agentes" in str(self.project_root).replace("\\", "/")
        self.git = GitClient(self.agent_path)
        self.sync_logic = SubmoduleSyncLogic()

    def sync_submodule(self):
        """Orquestra a sincronização de submódulos."""
        if not self.agent_path.exists(): return False
        
        self._acquire_lock()
        try:
            self._ensure_initialized()
            if not (self.agent_path / ".git").exists(): return False

            from src_local.utils.update_transaction import UpdateTransaction
            res = UpdateTransaction(self.git, self.project_root).execute(self.git.get_head_hash())
            return res
        finally:
            self._release_lock()

    def _ensure_initialized(self):
        if self.project_root.is_dir() and (not self.agent_path.exists() or not list(self.agent_path.iterdir())):
            try:
                subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True, check=True)
            except Exception as e:
                logger.error(f"❌ Falha na inicialização de submódulos: {e}")

    def check_submodule_status(self):
        if not self.is_internal: return []
        if not (self.agent_path / ".git").exists(): self._ensure_initialized()
        try:
            return self.sync_logic.get_submodule_delta(self.git, self.git.discover_remote())
        except Exception: return []

    def _get_topology(self, remote):
        active = self.git.get_current_branch()
        return {'active_ref': active, 'tracking_ref': self.git.get_tracking_branch(active)}

    def _validate_pre_conditions(self):
        return self.agent_path.exists()

    def _verify_system_integrity(self):
        """🧬 Valida a sintaxe Python de todos os arquivos."""
        py_files = [f for f in self.agent_path.rglob("*.py") 
                    if not (".agent" in str(f) and self.agent_path not in f.parents)]
        for f in py_files:
            try:
                src = f.read_text(encoding='utf-8', errors='ignore')
                if src.strip(): ast.parse(src)
            except Exception as e:
                logger.error(f"⚠️ Erro em {f.name}: {e}")
