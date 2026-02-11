"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Lógica de Sincronia de Submódulos (SubmoduleSyncLogic)
Função: Centralizar validações de trava (lock) e deltas de commit.
"""
import time
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class SubmoduleSyncLogic:
    def is_locked(self, lock_file):
        if not lock_file.exists(): return False
        
        mtime = datetime.fromtimestamp(lock_file.stat().st_mtime)
        if (datetime.now() - mtime) > timedelta(minutes=10):
            if lock_file.exists(): lock_file.unlink()
            return False
        return True

    def get_submodule_delta(self, git, remote):
        """Calcula a diferença de commits entre local e remoto."""
        import time
        start_time = time.time()
        
        if not remote: return []
        
        git.run(["fetch", remote], check=False)
        active = git.get_current_branch()
        tracking = git.get_tracking_branch(active)
        
        delta = git.get_commit_count(f"{active}..{remote}/{tracking}")
        
        if delta > 0:
            from src_local.utils.logging_config import log_performance
            log_performance(logger, start_time, "Telemetry: Submodule delta check")
            return [{"file": ".agent/skills", "issue": f"Delta: {delta} commits", "severity": "CRITICAL", "context": "DependencyAuditor"}]
        return []
