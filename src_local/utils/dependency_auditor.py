import subprocess
import logging
import time
import ast
from pathlib import Path
from src_local.utils.git_operations_phd import GitOperationsPhd

logger = logging.getLogger("BulletProofSync_v9")


class DependencyAuditor:
    """
    📦 Auditor de Dependências Soberano v9.
    Gerencia a integridade e sincronização via GitOperationsPhd.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.agent_path = self.project_root / ".agent" / "skills"
        self.lock_file = self.project_root / ".gemini" / "sync.lock"
        self.is_internal = "Personas_Agentes" in str(self.project_root).replace("\\", "/")

    def sync_submodule(self):
        """🚀 Executa a sincronização atômica."""
        if not self.is_internal or self._is_locked(): return False
        
        self._acquire_lock()
        initial_hash = None
        try:
            initial_hash = self._prepare_sync()
            if initial_hash is False: return False
            
            success = self._execute_sync_flow(initial_hash)
            if success: self._finalize_sync()
            
            self._release_lock()
            return success
        except Exception as e:
            logger.critical(f"🚨 [Auditor] Erro: {e}")
            if initial_hash: GitOperationsPhd.transactional_rollback(self.agent_path, initial_hash)
            self._release_lock()
            return False

    def _prepare_sync(self):
        """🛡️ Prepara o ambiente."""
        self._ensure_initialized()
        if not GitOperationsPhd.is_valid_repo(self.agent_path):
            self._release_lock()
            return False

        # Snapshot local
        if GitOperationsPhd.run_git_out(["status", "--porcelain"], self.agent_path):
            GitOperationsPhd.run_git(["add", "."], self.agent_path)
            subprocess.run(["git", "commit", "-m", "chore: Local Snapshot"], cwd=self.agent_path, capture_output=True)

        return GitOperationsPhd.run_git_out(["rev-parse", "HEAD"], self.agent_path)

    def _execute_sync_flow(self, initial_hash):
        """⚙️ Fluxo remoto."""
        remote = GitOperationsPhd.discover_remote(self.agent_path)
        if not remote: raise Exception("Sem remote.")

        GitOperationsPhd.run_git(["rebase", "--abort"], self.agent_path, check=False)
        topo = GitOperationsPhd.get_topology(self.agent_path, remote)
        
        GitOperationsPhd.run_git(["fetch", remote, "--prune"], self.agent_path)
        metrics = GitOperationsPhd.get_metrics(self.agent_path, topo['active_ref'], f"{remote}/{topo['tracking_ref']}")
        
        if metrics['behind'] == 0: return True

        return self._integrate_remote_changes(remote, topo, metrics)

    def _integrate_remote_changes(self, remote, topo, metrics):
        """🧬 Integração."""
        subprocess.run(["git", "stash", "push", "--include-untracked", "-m", "Auto-stash"], cwd=self.agent_path, capture_output=True)
        target = f"{remote}/{topo['tracking_ref']}"
        if subprocess.run(["git", "rebase", target], cwd=self.agent_path, capture_output=True).returncode != 0:
            self._handle_sync_conflict(target)
        self._verify_system_integrity()
        return True

    def _handle_sync_conflict(self, target):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
        subprocess.run(["git", "merge", target, "-m", "🧬 Sincronia", "-X", "theirs"], cwd=self.agent_path, capture_output=True)
        self._resolve_semantic_conflicts()

    def _finalize_sync(self):
        """✨ Finalização."""
        GitOperationsPhd.run_git(["add", "."], self.agent_path)
        subprocess.run(["git", "commit", "-m", "⚡ Auto-Sync"], cwd=self.agent_path, capture_output=True)
        subprocess.run(["git", "add", ".agent/skills"], cwd=self.project_root, capture_output=True)
        if subprocess.run(["git", "stash", "pop"], cwd=self.agent_path, capture_output=True).returncode != 0:
            self._resolve_semantic_conflicts()
            GitOperationsPhd.run_git(["add", "."], self.agent_path)
            subprocess.run(["git", "commit", "--amend", "--no-edit"], cwd=self.agent_path, capture_output=True)

    def _resolve_semantic_conflicts(self):
        conflicts = GitOperationsPhd.run_git_out(["diff", "--name-only", "--diff-filter=U"], self.agent_path).splitlines()
        for f in conflicts:
            strat = "--ours" if "skills/" in f or "data/" in f else "--theirs"
            GitOperationsPhd.run_git(["checkout", strat, f], self.agent_path)
            GitOperationsPhd.run_git(["add", f], self.agent_path)

    def _ensure_initialized(self):
        if not self.agent_path.exists() or not list(self.agent_path.iterdir()):
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True)

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

    def _verify_system_integrity(self):
        for f in self.agent_path.rglob("*.py"):
            if ".agent" in str(f) or "__pycache__" in str(f): continue
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except: logger.error(f"⚠️ Integridade violada: {f.name}")

    def check_submodule_status(self):
        if not self.is_internal: return []
        if not (self.agent_path / ".git").exists(): self._ensure_initialized()
        try:
            remote = GitOperationsPhd.discover_remote(self.agent_path)
            if not remote: return []
            GitOperationsPhd.run_git(["fetch", remote], self.agent_path)
            topo = GitOperationsPhd.get_topology(self.agent_path, remote)
            delta = GitOperationsPhd.get_metrics(self.agent_path, topo['active_ref'], f"{remote}/{topo['tracking_ref']}")['behind']
            if delta > 0:
                return [{"file": ".agent/skills", "issue": f"Atraso: {delta} commits", "severity": "CRITICAL", "context": "Auditor"}]
        except Exception: pass
        return []
