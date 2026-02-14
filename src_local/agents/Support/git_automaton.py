"""
👻 Git Automaton.
O braço mecânico que torna as decisões da IA permanentes via Version Control.
"""
import logging
import subprocess
import time
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class GitAutomaton:
    def __init__(self, project_root):
        self.project_root = Path(project_root)

    def _run_git(self, args):
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                encoding='utf-8',
                check=False # Não dar exception, tratar retorno
            )
            return result.stdout.strip(), result.returncode
        except Exception as e:
            logger.error(f"❌ Git Error: {e}")
            return "", 1

    def is_clean_state(self):
        """Verifica se há mudanças não commitadas (Staged ou Unstaged)."""
        out, _ = self._run_git(["status", "--porcelain"])
        return len(out) == 0

    def commit_fix(self, fix_description, affected_files):
        """
        Cria uma branch e commita a correção automaticamente.
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        branch_name = f"sovereign/fix_{timestamp}"
        
        # 1. Cria e muda para a branch de correção
        logger.info(f"👻 [Git] Criando branch de cura: {branch_name}")
        self._run_git(["checkout", "-b", branch_name])
        
        # 2. Adiciona arquivos modificados
        for file_path in affected_files:
            rel_path = Path(file_path).relative_to(self.project_root)
            self._run_git(["add", str(rel_path)])
        
        # 3. Commit com mensagem semântica
        commit_msg = f"fix(ai): {fix_description}

Automated fix by Sovereign AI during idle cycle."
        out, code = self._run_git(["commit", "-m", commit_msg])
        
        if code == 0:
            logger.info(f"✅ [Git] Correção salva na branch {branch_name}.")
            return branch_name
        else:
            logger.error(f"❌ [Git] Falha ao commitar: {out}")
            return None
