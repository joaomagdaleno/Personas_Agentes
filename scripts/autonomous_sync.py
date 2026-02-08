"""
🔄 Sincronia Autônoma de Dependências e Conhecimento.
Este script orquestra o processo de atualização do ecossistema, incluindo
diagnóstico de saúde do Git, sincronização de submódulos de skills e 
consolidação de mudanças no repositório soberano.
"""
import os
import sys
import logging
import subprocess
from pathlib import Path

# Adiciona a raiz do projeto ao sys.path para importar src_local
project_root = Path(__file__).parent.parent.absolute()
sys.path.append(str(project_root))

from src_local.utils.dependency_auditor import DependencyAuditor
from scripts.git_doctor import GitDoctor

def check_internet():
    try:
        # Tenta pingar o Google DNS
        subprocess.run(["ping", "-n", "1", "8.8.8.8"], capture_output=True, check=True)
        return True
    except:
        return False

def main():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    logger = logging.getLogger("AutonomousSync")

    if not check_internet():
        logger.warning("Sem conexão com a internet. Abortando sincronia.")
        return

    logger.info("📡 Internet detectada. Iniciando sincronia autônoma...")
    
    # 1. Limpeza e Diagnóstico de Git
    doctor = GitDoctor(project_root)
    doctor.diagnose_and_fix()

    # 2. Sincronia de Submódulo
    auditor = DependencyAuditor(project_root)
    success = auditor.sync_submodule()
    
    if success:
        # Verifica se houve mudança no ponteiro do submódulo ou em outros arquivos
        status = subprocess.run(["git", "status", "--porcelain"], cwd=project_root, capture_output=True, text=True).stdout.strip()
        if status:
            logger.info("📦 Detectadas mudanças no repositório pai. Consolidando...")
            subprocess.run(["git", "add", "."], cwd=project_root)
            subprocess.run(["git", "commit", "-m", "chore(sync): auto-update submodule skills"], cwd=project_root)
            subprocess.run(["git", "push", "origin", "HEAD"], cwd=project_root)
            logger.info("🚀 Mudanças enviadas para o repositório pai.")
        
        logger.info("✅ Sincronia concluída com sucesso.")
    else:
        logger.error("❌ Falha na sincronia do submódulo.")

if __name__ == "__main__":
    main()
