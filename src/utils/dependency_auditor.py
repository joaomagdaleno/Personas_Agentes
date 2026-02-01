import subprocess
import logging
import time
import json
import ast
import os
import re
import shutil
from pathlib import Path

logger = logging.getLogger("BulletProofSync_v8")

class DependencyAuditor:
    """
    Sovereign Sync Engine v8: The Bullet-Proof Version.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.agent_path = self.project_root / ".agent" / "skills"
        self.lock_file = self.project_root / ".gemini" / "sync.lock"

    def sync_submodule(self):
        """Executa a sincronização com segurança absoluta."""
        if not self._is_valid_repo(): return False
        if self._is_locked(): return False
        
        self._acquire_lock()
        initial_hash = self._git_out(["rev-parse", "HEAD"], self.agent_path)
        
        try:
            if not self._verify_network_health():
                raise Exception("Network Error")

            self._pre_flight_cleanup()
            topo = self._get_topology()
            
            self._run_git(["fetch", "upstream", "--prune"], self.agent_path)
            metrics = self._get_metrics(topo['active_ref'], topo['tracking_ref'])
            
            if metrics['behind'] == 0:
                self._release_lock()
                return True

            subprocess.run(["git", "stash", "push", "--include-untracked"], cwd=self.agent_path, capture_output=True)
            subprocess.run(["git", "rebase", topo['tracking_ref']], cwd=self.agent_path, capture_output=True)

            self._verify_system_integrity()

            subprocess.run(["git", "add", ".agent/skills"], cwd=self.project_root, capture_output=True)
            subprocess.run(["git", "stash", "pop"], cwd=self.agent_path, capture_output=True)
            
            self._release_lock()
            return True

        except Exception as e:
            logger.critical(f"🚨 Erro: {e}")
            self._transactional_rollback(initial_hash)
            self._release_lock()
            return False

    def _is_locked(self): return self.lock_file.exists()
    def _acquire_lock(self): 
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self.lock_file.write_text("lock")
    def _release_lock(self):
        if self.lock_file.exists(): self.lock_file.unlink()

    def _verify_network_health(self):
        try:
            subprocess.run(["git", "ls-remote", "upstream", "HEAD"], cwd=self.agent_path, capture_output=True, timeout=5)
            return True
        except Exception: 
            return False

    def _get_metrics(self, local, remote):
        try:
            res = subprocess.run(["git", "rev-list", "--count", f"{local}..{remote}"], cwd=self.agent_path, capture_output=True, text=True).stdout.strip()
            return {'behind': int(res or 0)}
        except Exception: 
            return {'behind': 0}

    def _verify_system_integrity(self):
        for f in self.agent_path.rglob("*.py"):
            source = f.read_text(encoding='utf-8', errors='ignore')
            if source.strip():
                ast.parse(source)

    def _get_topology(self):
        active = self._git_out(["rev-parse", "--abbrev-ref", "HEAD"], self.agent_path)
        tracking = self._git_out(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], self.agent_path)
        return {'active_ref': active, 'tracking_ref': tracking if tracking else "upstream/main"}

    def _pre_flight_cleanup(self):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)

    def _transactional_rollback(self, target_hash):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
        if target_hash:
            subprocess.run(["git", "reset", "--hard", target_hash], cwd=self.agent_path, capture_output=True)

    def _git_out(self, args, path):
        return subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True).stdout.strip()

    def _run_git(self, args, path):
        return subprocess.run(["git"] + args, cwd=path, capture_output=True, check=True)

    def _is_valid_repo(self):
        return self.agent_path.exists() and (self.agent_path / ".git").exists()

    def check_submodule_status(self):
        if not self._is_valid_repo(): return []
        try:
            topo = self._get_topology()
            metrics = self._get_metrics(topo['active_ref'], topo['tracking_ref'])
            if metrics['behind'] > 0:
                return [{"file": ".agent/skills", "issue": f"Delta: {metrics['behind']}", "severity": "CRITICAL", "context": "DependencyAuditor"}]
        except Exception as e:
            logger.error(f'Falha operacional em src/utils/dependency_auditor.py: {e}', exc_info=True)
        return []
