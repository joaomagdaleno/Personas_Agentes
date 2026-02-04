import subprocess, os, logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("GitDoctor")

PROTECTED_PATHS = ["skills/fast-android-build"]
PROTECTED_SKILL_IDS = ["fast-android-build"]

class GitDoctor:
    def __init__(self, root_path): self.root = Path(root_path)

    def run_command(self, args, cwd=None):
        return subprocess.run(["git"] + args, cwd=str(cwd or self.root), capture_output=True, text=True)

    def _clear_locks(self):
        git_dir = self.root / ".git"
        if git_dir.exists():
            for lock in git_dir.rglob("*.lock"):
                try: os.remove(lock)
                except Exception as e: logger.debug(f"⚠️ Falha ao remover trava Git: {e}")

    def diagnose_and_fix(self):
        logger.info("🩺 Diagnóstico Git PhD...")
        if not (self.root / ".git").exists(): return
        from src_local.utils.maintenance_engine_phd import MaintenanceEnginePhd
        from src_local.utils.conflict_policy_phd import ConflictPolicyPhd
        
        self._clear_locks()
        is_rebase = (self.root / ".git" / "rebase-merge").exists() or (self.root / ".git" / "rebase-apply").exists()
        is_merge = (self.root / ".git" / "MERGE_HEAD").exists()
        
        if is_rebase or is_merge:
            policy = ConflictPolicyPhd(self.root, self.run_command)
            status = self.run_command(["status", "--porcelain"]).stdout
            lines = [l for l in status.splitlines() if l.startswith(("UU", "AA", "AU", "UA", "UD", "DU"))]
            for line in lines: 
                policy.resolve_file(line[3:].strip(), 
                                  lambda p: MaintenanceEnginePhd.merge_skills_index(self.root, p, self.run_command, PROTECTED_SKILL_IDS),
                                  lambda p: any(x in p for x in PROTECTED_PATHS))
            if is_rebase: subprocess.run(["git", "rebase", "--continue"], env={**os.environ, "GIT_EDITOR": "true"}, cwd=str(self.root))
            elif is_merge: self.run_command(["commit", "-m", "chore: PhD resolve"])

        self.run_command(["rm", "-r", "--cached", "**/__pycache__/*"])
        MaintenanceEnginePhd.clean_submodules(self.root, self.run_command)
        print(f"--- STATUS ---\n{self.run_command(['status', '--short', '--branch']).stdout}")

if __name__ == "__main__": GitDoctor(os.getcwd()).diagnose_and_fix()
