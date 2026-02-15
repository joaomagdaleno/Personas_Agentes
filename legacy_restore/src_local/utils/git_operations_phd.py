import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class GitOperationsPhd:
    """🛠️ Operações Git PhD: Camada de Abstração de Baixo Nível."""
    
    @staticmethod
    def run_git_out(args, cwd):
        logger.debug(f"Executing git command: {args} in {cwd}")
        return subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True).stdout.strip()

    @staticmethod
    def run_git(args, cwd, check=True):
        logger.debug(f"Executing git (check={check}): {args} in {cwd}")
        subprocess.run(["git"] + args, cwd=cwd, capture_output=True, check=check)

    @staticmethod
    def is_valid_repo(path):
        return path.exists() and (path / ".git").exists()

    @staticmethod
    def discover_remote(path):
        remotes = GitOperationsPhd.run_git_out(["remote"], path).splitlines()
        for r in ["upstream", "origin"]:
            if r in remotes:
                try:
                    subprocess.run(["git", "ls-remote", "--heads", r], cwd=path, capture_output=True, timeout=5, check=True)
                    return r
                except: continue
        return None

    @staticmethod
    def get_topology(path, remote="upstream"):
        active = GitOperationsPhd.run_git_out(["rev-parse", "--abbrev-ref", "HEAD"], path)
        tracking = GitOperationsPhd.run_git_out(["config", f"branch.{active}.merge"], path).replace("refs/heads/", "")
        if not tracking: tracking = "main"
        return {'active_ref': active, 'tracking_ref': tracking}

    @staticmethod
    def get_metrics(path, local, remote_ref):
        try:
            res = GitOperationsPhd.run_git_out(["rev-list", "--count", f"{local}..{remote_ref}"], path)
            return {'behind': int(res or 0)}
        except: return {'behind': 0}

    @staticmethod
    def transactional_rollback(path, target_hash):
        subprocess.run(["git", "rebase", "--abort"], cwd=path, capture_output=True)
        if target_hash: subprocess.run(["git", "reset", "--hard", target_hash], cwd=path, capture_output=True)
