import subprocess, logging, time, ast
from pathlib import Path
from src_local.utils.git_operations_phd import GitOperationsPhd

logger = logging.getLogger("Auditor_v9_Scrub")

class DependencyAuditor:
    def __init__(self, project_root):
        self.root = Path(project_root)
        self.agent_path = self.root / ".agent" / "skills"
        self.lock_file = self.root / ".gemini" / "sync.lock"

    def sync_submodule(self):
        if "Personas_Agentes" not in str(self.root).replace("\\", "/") or self._is_locked(): return False
        self._acquire_lock()
        try:
            h = self._prepare()
            if h and self._flow(h): self._finalize()
            return True
        except Exception as e:
            logger.error(f"🚨 Erro: {e}")
            return False
        finally: self._release_lock()

    def _prepare(self):
        if not self.agent_path.exists(): subprocess.run(["git", "submodule", "update", "--init"], cwd=self.root)
        if GitOperationsPhd.run_git_out(["status", "--porcelain"], self.agent_path):
            GitOperationsPhd.run_git(["add", "."], self.agent_path)
            subprocess.run(["git", "commit", "-m", "chore: Local Snapshot"], cwd=self.agent_path)
        return GitOperationsPhd.run_git_out(["rev-parse", "HEAD"], self.agent_path)

    def _flow(self, initial_hash):
        remote = GitOperationsPhd.discover_remote(self.agent_path)
        if not remote: return False
        GitOperationsPhd.run_git(["fetch", remote], self.agent_path)
        topo = GitOperationsPhd.get_topology(self.agent_path, remote)
        target = f"{remote}/{topo['tracking_ref']}"
        subprocess.run(["git", "stash"], cwd=self.agent_path)
        if subprocess.run(["git", "rebase", target], cwd=self.agent_path).returncode != 0:
            subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path)
            subprocess.run(["git", "merge", target, "-X", "theirs"], cwd=self.agent_path)
        subprocess.run(["git", "stash", "pop"], cwd=self.agent_path)
        return True

    def _finalize(self):
        GitOperationsPhd.run_git(["add", "."], self.agent_path)
        subprocess.run(["git", "commit", "-m", "⚡ Auto-Sync"], cwd=self.agent_path)
        subprocess.run(["git", "add", ".agent/skills"], cwd=self.root)

    def _is_locked(self):
        return self.lock_file.exists() and time.time() - self.lock_file.stat().st_mtime < 600

    def _acquire_lock(self):
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self.lock_file.write_text(str(time.time()))

    def _release_lock(self):
        if self.lock_file.exists(): self.lock_file.unlink()

    def check_submodule_status(self):
        try:
            remote = GitOperationsPhd.discover_remote(self.agent_path)
            topo = GitOperationsPhd.get_topology(self.agent_path, remote)
            delta = GitOperationsPhd.get_metrics(self.agent_path, topo['active_ref'], f"{remote}/{topo['tracking_ref']}")['behind']
            if delta > 0: return [{"file": ".agent/skills", "issue": f"Delta: {delta}", "severity": "CRITICAL", "context": "Auditor"}]
        except Exception as e: logger.debug(f"⚠️ Erro silencioso em Auditor: {e}")
        return []
