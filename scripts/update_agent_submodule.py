import os
import sys
import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

def update_submodule():
    """
    Atualiza submodulos com segurança PhD.
    - Proteção contra Injeção de Carga Útil
    - Uso de Pathlib para caminhos
    """
    logger.info("Iniciando atualização de submódulos...")
    project_root = Path(__file__).parent.parent
    
    try:
        # Comando seguro via lista
        subprocess.run(
            ["git", "submodule", "update", "--init", "--recursive"],
            cwd=project_root,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("✅ Submódulos atualizados com sucesso.")
    except subprocess.CalledProcessError as e:
        logger.error(f"Falha na atualização: {e.stderr}")
    except Exception as e:
        logger.error(f"Erro inesperado: {e}")

if __name__ == "__main__":
    update_submodule()