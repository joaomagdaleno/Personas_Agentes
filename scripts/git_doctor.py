import subprocess
import os
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("GitDoctor")

class GitDoctor:
    def __init__(self, root_path):
        self.root = Path(root_path)

    def run_command(self, args, cwd=None):
        if cwd is None: cwd = self.root
        result = subprocess.run(["git"] + args, cwd=str(cwd), capture_output=True, text=True)
        return result

    def _resolve_unmerged(self):
        status = self.run_command(["status", "--porcelain"]).stdout
        lines = status.splitlines()
        has_conflicts = False
        for line in lines:
            if line.startswith(("UU", "AA", "AU", "UA", "UD", "DU")):
                has_conflicts = True
                f = line[3:].strip()
                if "__pycache__" in f or f.endswith(".pyc"):
                    logger.info(f"🗑️ Removendo cache conflitante: {f}")
                    self.run_command(["rm", "--cached", f])
                    full_path = self.root / f
                    if full_path.exists():
                        try: os.remove(full_path)
                        except: pass
                else:
                    logger.info(f"👉 Resolvendo {f} com 'ours' (estratégia conservadora)")
                    self.run_command(["checkout", "--ours", f])
                    self.run_command(["add", f])
        return has_conflicts

    def diagnose_and_fix(self):
        logger.info("🩺 Iniciando diagnóstico Git...")
        
        if not (self.root / ".git").exists():
            logger.error("❌ Não é um repositório Git!")
            return

        # 1. Resolver conflitos se estiver em rebase ou merge
        is_rebase = (self.root / ".git" / "rebase-merge").exists() or (self.root / ".git" / "rebase-apply").exists()
        is_merge = (self.root / ".git" / "MERGE_HEAD").exists()

        if is_rebase or is_merge:
            logger.warning("🩹 Rebase/Merge detectado. Limpando...")
            while self._resolve_unmerged():
                if is_rebase:
                    logger.info("⏩ Continuando rebase...")
                    res = subprocess.run(["git", "rebase", "--continue"], env={**os.environ, "GIT_EDITOR": "true"}, cwd=str(self.root), capture_output=True, text=True)
                    if res.returncode == 0: break
                elif is_merge:
                    logger.info("⏩ Finalizando merge...")
                    self.run_command(["commit", "-m", "chore(git): auto-resolve merge conflicts"], cwd=self.root)
                    break

        # 2. Limpar rastreamento de lixo
        logger.info("🧹 Excluindo arquivos de cache do índice...")
        self.run_command(["rm", "-r", "--cached", "**/__pycache__/*"])
        self.run_command(["rm", "--cached", "*.pyc"])
        
        # 3. Sincronizar Submódulos
        if (self.root / ".gitmodules").exists():
            logger.info("📦 Sincronizando submódulos...")
            self.run_command(["submodule", "update", "--init", "--recursive"])

        # 4. Status Final
        logger.info("✅ Diagnóstico concluído.")
        final_status = self.run_command(["status", "--short", "--branch"]).stdout
        print("\n--- STATUS ATUAL ---")
        print(final_status)

if __name__ == "__main__":
    doctor = GitDoctor(os.getcwd())
    doctor.diagnose_and_fix()
