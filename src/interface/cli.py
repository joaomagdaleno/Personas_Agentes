import sys
import logging
from pathlib import Path
from src.core.orchestrator import Orchestrator
from src.utils.logging_config import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

def main():
    """Interface CLI Moderna: Pathlib e PhD Integration."""
    project_root = Path.cwd()
    logger.info(f"Workshop PhD iniciado em: {project_root}")
    
    orchestrator = Orchestrator(project_root)
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "audit":
            logger.info("Executando Auditoria Estratégica...")
            results = orchestrator.run_phd_audit()
            print(f"Relatório gerado com {len(results)} pontos.")
        elif cmd == "heal":
            logger.info("Iniciando Protocolo de Auto-Cura...")
            orchestrator.run_auto_healing()
    else:
        print("🏛️ Workshop PhD CLI")
        print("Comandos: audit, heal")

if __name__ == "__main__":
    main()