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

    def _clear_locks(self):
        """Remove arquivos de lock que travam o Git."""
        git_dir = self.root / ".git"
        if not git_dir.exists(): return
        
        logger.info("🔍 Procurando por arquivos de lock pendentes...")
        locks = list(git_dir.rglob("*.lock"))
        for lock in locks:
            try:
                logger.warning(f"🗑️ Removendo lock: {lock}")
                os.remove(lock)
            except Exception as e:
                logger.error(f"❌ Não foi possível remover {lock}: {e}")

    def _clean_submodules(self):
        """Limpa sujeira (untracked files) dentro de todos os submódulos."""
        if not (self.root / ".gitmodules").exists(): return

        logger.info("🧹 Iniciando limpeza profunda de submódulos...")
        # Obter caminhos dos submódulos
        res = self.run_command(["submodule", "foreach", "--quiet", "echo $displaypath"])
        if res.returncode == 0:
            sub_paths = res.stdout.splitlines()
            for sub in sub_paths:
                sub_dir = self.root / sub.strip()
                if sub_dir.exists():
                    logger.info(f"👉 Limpando submódulo: {sub}")
                    # Remove arquivos não rastreados no submódulo
                    subprocess.run(["git", "clean", "-fd"], cwd=str(sub_dir), capture_output=True)
                    # Força reset se houver mudanças no index do submódulo (estratégia agressiva para resolver o alerta)
                    subprocess.run(["git", "reset", "--hard"], cwd=str(sub_dir), capture_output=True)

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
        logger.info("🩺 Iniciando diagnóstico Git PhD...")
        
        if not (self.root / ".git").exists():
            logger.error("❌ Não é um repositório Git!")
            return

        # 1. Limpar Locks
        self._clear_locks()

        # 2. Resolver conflitos se estiver em rebase ou merge
        is_rebase = (self.root / ".git" / "rebase-merge").exists() or (self.root / ".git" / "rebase-apply").exists()
        is_merge = (self.root / ".git" / "MERGE_HEAD").exists()

        if is_rebase or is_merge:
            logger.warning("🩹 Rebase/Merge detectado. Limpando...")
            try:
                while self._resolve_unmerged():
                    if is_rebase:
                        logger.info("⏩ Continuando rebase...")
                        res = subprocess.run(["git", "rebase", "--continue"], env={**os.environ, "GIT_EDITOR": "true"}, cwd=str(self.root), capture_output=True, text=True)
                        if res.returncode == 0: break
                        if "cannot lock ref" in res.stderr:
                             logger.warning("🔒 Erro de trava detectado durante rebase. Limpando novamente...")
                             self._clear_locks()
                    elif is_merge:
                        logger.info("⏩ Finalizando merge...")
                        self.run_command(["commit", "-m", "chore(git): auto-resolve merge conflicts"], cwd=self.root)
                        break
            except Exception as e:
                logger.error(f"🚨 Falha crítica no rebase: {e}. Abortando para segurança.")
                self.run_command(["rebase", "--abort"])

        # 3. Limpar rastreamento de lixo no repo pai
        logger.info("🧹 Excluindo arquivos de cache do índice pai...")
        self.run_command(["rm", "-r", "--cached", "**/__pycache__/*"])
        self.run_command(["rm", "--cached", "*.pyc"])
        
        # 4. Limpeza de Submódulos (Resolve o "untracked changes" do usuário)
        self._clean_submodules()

        # 5. Sincronizar Submódulos
        if (self.root / ".gitmodules").exists():
            logger.info("📦 Sincronizando submódulos...")
            self.run_command(["submodule", "update", "--init", "--recursive"])

        # 6. Status Final
        logger.info("✅ Diagnóstico concluído.")
        final_status = self.run_command(["status", "--short", "--branch"]).stdout
        print("\n--- STATUS ATUAL ---")
        print(final_status)

if __name__ == "__main__":
    doctor = GitDoctor(os.getcwd())
    doctor.diagnose_and_fix()
