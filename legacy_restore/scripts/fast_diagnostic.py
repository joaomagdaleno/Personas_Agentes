import logging
import sys
import os
from pathlib import Path

# FBI MODE
current_dir = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(current_dir))
os.chdir(str(current_dir))

from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging

def main():
    """🚀 Fast Diagnostic: Gera relatórios em segundos ignorando testes unitários."""
    configure_logging()
    logger = logging.getLogger("FastMonitor")
    
    project_root = Path.cwd()
    logger.info(f"📡 Acionando Diagnóstico Rápido: {project_root}")
    
    orchestrator = Orchestrator(project_root)
    # Ativa o skip_tests no método oficial
    report_path = orchestrator.generate_full_diagnostic(skip_tests=True)
    
    logger.info(f"✅ Diagnóstico concluído em: {report_path.name}")

if __name__ == "__main__":
    main()
