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
        result = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True)
        return result

    def diagnose_and_fix(self):
        logger.info("🩺 Iniciando diagnóstico Git...")
        
        # 1. Verificar se estamos em um repositório
        if not (self.root / ".git").exists():
            logger.error("❌ Não é um repositório Git!")
            return

        # 2. Limpar arquivos que deveriam ser ignorados mas foram rastreados
        logger.info("🧹 Limpando cache de arquivos ignorados...")
        self.run_command(["rm", "-r", "--cached", "."], cwd=self.root)
        self.run_command(["add", "."], cwd=self.root)
        
        # 3. Resolver conflitos automáticos se houver
        status = self.run_command(["status", "--porcelain"]).stdout
        if "UU" in status:
            logger.warning("⚠️ Conflitos detectados. Tentando resolução estratégica...")
            unmerged = [line[3:] for line in status.splitlines() if line.startswith("UU")]
            for f in unmerged:
                if f.endswith((".json", ".pyc", ".db")):
                    logger.info(f"👉 Resolvendo {f} com 'theirs' (binário/cache)")
                    self.run_command(["checkout", "--theirs", f])
                else:
                    logger.info(f"👉 Resolvendo {f} com 'ours' (código)")
                    self.run_command(["checkout", "--ours", f])
                self.run_command(["add", f])

        # 4. Sincronizar com remote
        logger.info("📡 Sincronizando com o upstream...")
        self.run_command(["fetch", "--all"])
        
        # 5. Verificar Submódulos
        if (self.root / ".gitmodules").exists():
            logger.info("📦 Validando submódulos...")
            self.run_command(["submodule", "update", "--init", "--recursive"])

        # 6. Status Final
        logger.info("✅ Diagnóstico concluído.")
        final_status = self.run_command(["status", "--short", "--branch"]).stdout
        print("\n--- STATUS ATUAL ---")
        print(final_status)

if __name__ == "__main__":
    doctor = GitDoctor(os.getcwd())
    doctor.diagnose_and_fix()
