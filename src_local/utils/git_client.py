import subprocess
from pathlib import Path

class GitClient:
    """Invólucro para operações Git de baixo nível."""
    
    def __init__(self, repo_path: Path):
        self.cwd = repo_path

    def run(self, args, check=True, capture=True):
        return subprocess.run(["git"] + args, cwd=self.cwd, capture_output=capture, check=check, text=True)

    def get_output(self, args):
        res = self.run(args, check=False)
        return res.stdout.strip() if res.stdout else ""

    def fetch_prune(self, remote):
        self.run(["fetch", remote, "--prune"])

    def discover_remote(self):
        remotes = self.get_output(["remote"]).splitlines()
        for r in ["upstream", "origin"]:
            if r in remotes:
                try:
                    self.run(["ls-remote", "--heads", r], check=True)
                    return r
                except: continue
        return None

    def get_commit_count(self, rev_range):
        res = self.get_output(["rev-list", "--count", rev_range])
        return int(res or 0)

    def stash_push(self, msg):
        self.run(["stash", "push", "--include-untracked", "-m", msg], check=False)

    def stash_pop(self):
        self.run(["stash", "pop"], check=False)

    def rebase(self, target):
        return self.run(["rebase", target], check=False)

    def rebase_abort(self):
        self.run(["rebase", "--abort"], check=False)

    def reset_hard(self, target):
        return self.run(["reset", "--hard", target], check=False)

    def get_current_branch(self):
        return self.get_output(["rev-parse", "--abbrev-ref", "HEAD"])

    def get_tracking_branch(self, active_branch):
        t = self.get_output(["config", f"branch.{active_branch}.merge"])
        return t.replace("refs/heads/", "") if t else "main"

    def get_head_hash(self):
        return self.get_output(["rev-parse", "HEAD"])
