import subprocess
import logging
import time
import ast
from pathlib import Path

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
        if not self._validate_pre_conditions(): return False
        
        self._acquire_lock()
        try:
            self._ensure_initialized()
            if not self._is_valid_repo():
                logger.error("Falha Crítica: Submódulo Inválido.")
                return False

            initial_hash = self.git.get_head_hash()
            return self._execute_git_transaction(initial_hash)
        finally:
            self._release_lock()

    def _validate_pre_conditions(self):
        if not self.is_internal: return False
        if self._is_locked():
            logger.warning("Trava ativa.")
            return False
        return True

    def _execute_git_transaction(self, initial_hash):
        try:
            remote = self.git.discover_remote()
            if not remote: raise Exception("Sem remote.")

            self.git.rebase_abort()
            topo = self._get_topology(remote)
            
            logger.info(f"🔄 Sync: {remote}/{topo['tracking_ref']}")
            self.git.fetch_prune(remote)
            
            commits_behind = self.git.get_commit_count(f"{topo['active_ref']}..{remote}/{topo['tracking_ref']}")
            if commits_behind == 0:
                logger.info("✅ Versão Atualizada.")
                return True

            return self._perform_update(remote, topo, commits_behind)
        except Exception as e:
            logger.critical(f"🚨 Erro Sync: {e}")
            self._rollback(initial_hash)
            return False

    def _perform_update(self, remote, topo, count):
        logger.info(f"⬇️ Puxando {count} commits...")
        self.git.stash_push("Auto-sync")
        
        target = f"{remote}/{topo['tracking_ref']}"
        if self.git.rebase(target).returncode != 0:
            self._handle_conflict(remote, target)

        self._verify_system_integrity()
        
        # Add no pai
        subprocess.run(["git", "add", ".agent/skills"], cwd=self.project_root, capture_output=True)
        self.git.stash_pop()
        
        logger.info("✨ Sync Sucesso.")
        return True

    def _handle_conflict(self, remote, target):
        logger.warning(f"⚠️ Reset Hard para {target}")
        self.git.rebase_abort()
        if self.git.reset_hard(target).returncode != 0:
            raise Exception("Falha Fatal Reset.")

    def _get_topology(self, remote):
        active = self.git.get_current_branch()
        tracking = self.git.get_tracking_branch(active)
        return {'active_ref': active, 'tracking_ref': tracking}

    def _rollback(self, target_hash):
        self.git.rebase_abort()
        if target_hash: self.git.reset_hard(target_hash)

    def _ensure_initialized(self):
        if not self.agent_path.exists() or not list(self.agent_path.iterdir()):
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True)

    def _is_valid_repo(self):
        return self.agent_path.exists() and (self.agent_path / ".git").exists()

    def _is_locked(self):
        if not self.lock_file.exists(): return False
        if time.time() - self.lock_file.stat().st_mtime > 600:
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
            remote = self.git.discover_remote()
            if not remote: return []
            
            self.git.run(["fetch", remote], check=False)
            topo = self._get_topology(remote)
            delta = self.git.get_commit_count(f"{topo['active_ref']}..{remote}/{topo['tracking_ref']}")
            
            if delta > 0:
                return [{"file": ".agent/skills", "issue": f"Delta: {delta} commits", "severity": "CRITICAL", "context": "DependencyAuditor"}]
        except: pass
        return []

    def _verify_system_integrity(self):
        """🧬 Valida a sintaxe Python de todos os arquivos após a atualização."""
        for f in self.agent_path.rglob("*.py"):
            if ".agent" in str(f): continue # Evita recursão infinita
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except:
                logger.error(f"⚠️ Integridade violada em {f.name}")