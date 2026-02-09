import subprocess
import logging
import time
import ast
import json
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
        self.project_root = Path(project_root)
        self.agent_path = self.project_root / ".agent" / "skills"
        self.lock_file = self.project_root / ".gemini" / "sync.lock"
        self.is_internal = "Personas_Agentes" in str(self.project_root).replace("\\", "/")
        self.git = GitClient(self.agent_path)

    def sync_submodule(self):
        """Orquestra: Validação -> Boot -> Lock -> Sync -> Verify."""
        start_t = time.time()
        if not self._validate_pre_conditions(): return False
        
        self._acquire_lock()
        try:
            self._ensure_initialized()
            if not self._is_valid_repo():
                logger.error("Falha Crítica: Submódulo Inválido.")
                return False

            initial_hash = self.git.get_head_hash()
            from src_local.utils.update_transaction import UpdateTransaction
            res = UpdateTransaction(self.git, self.project_root).execute(initial_hash)
            log_performance(logger, start_t, "📦 [DependencyAuditor] Sincronização de submódulos", level=logging.INFO)
            return res
        finally:
            self._release_lock()

    def _ensure_initialized(self):
        if not self.agent_path.exists() or not list(self.agent_path.iterdir()):
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True)

    def _is_valid_repo(self):
        return self.agent_path.exists() and (self.agent_path / ".git").exists()

    def _is_locked(self):
        if not self.lock_file.exists(): return False
        
        # Sincronia de Lock Soberana (Standardized timeout)
        from datetime import datetime, timedelta
        mtime = datetime.fromtimestamp(self.lock_file.stat().st_mtime)
        if (datetime.now() - mtime) > timedelta(minutes=10):
            self._release_lock()
            return False
        return True



    def _acquire_lock(self):
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self.lock_file.write_text(str(time.time()))

    def _release_lock(self):
        if self.lock_file.exists(): self.lock_file.unlink()

    def check_submodule_status(self):
        if not self.is_internal: return []
        if not (self.agent_path / ".git").exists(): self._ensure_initialized()

        try:
            return self._get_submodule_delta()
        except Exception as e:
            logger.error(f"⚠️ Erro ao verificar status do submódulo: {e}")
        return []

    def _get_submodule_delta(self):
        """Calcula a diferença de commits entre local e remoto."""
        remote = self.git.discover_remote()
        if not remote: return []
        
        self.git.run(["fetch", remote], check=False)
        topo = self._get_topology(remote)
        delta = self.git.get_commit_count(f"{topo['active_ref']}..{remote}/{topo['tracking_ref']}")
        
        if delta > 0:
            return [{"file": ".agent/skills", "issue": f"Delta: {delta} commits", "severity": "CRITICAL", "context": "DependencyAuditor"}]
        return []

    def _verify_network_health(self):
        """🌐 Verifica se o repositório remoto está acessível."""
        return self.git.discover_remote() is not None

    def _get_topology(self, remote):
        """🧬 Mapeia a topologia de branches local vs remoto."""
        active = self.git.get_current_branch()
        tracking = self.git.get_tracking_branch(active)
        return {'active_ref': active, 'tracking_ref': tracking}

    def _validate_pre_conditions(self):
        """🛡️ Valida se o ambiente está pronto para sincronização."""
        if not self.agent_path.exists(): 
            logger.warning("Agent path does not exist.")
            return False
        return True

    def _verify_system_integrity(self):
        """🧬 Valida a sintaxe Python de todos os arquivos após a atualização."""
        # Filtra arquivos pertinentes (ignora recursão .agent dentro de .agent se houver)
        py_files = [f for f in self.agent_path.rglob("*.py") 
                    if not (".agent" in str(f) and self.agent_path not in f.parents)]
        
        for f in py_files:
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except Exception as e:
                logger.error(f"⚠️ Integridade violada em {f.name}: {e}", exc_info=True)