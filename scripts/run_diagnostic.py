import logging
import sys
from pathlib import Path

# Adiciona o diretório raiz ao sys.path
sys.path.append(str(Path(__file__).parent.parent))

from src.core.orchestrator import Orchestrator
from src.utils.logging_config import configure_logging

def main():
    """
    PORTAL DE CONSCIÊNCIA: Capaz de auditar este ou qualquer outro repositório.
    Uso: python run_diagnostic.py [caminho_do_projeto]
    """
    configure_logging()
    logger = logging.getLogger("SystemMonitor")
    
    # Se um argumento for passado, usa como alvo. Senão, usa o diretório atual.
    if len(sys.argv) > 1:
        project_root = Path(sys.argv[1]).absolute()
    else:
        project_root = Path.cwd()
    
    if not project_root.exists():
        logger.error(f"❌ Caminho não encontrado: {project_root}")
        return

    logger.info(f"📡 Acionando Autoconsciência sobre o alvo: {project_root}")
    
    # O Orquestrador agora é autossuficiente e carrega seus próprios PhDs
    orchestrator = Orchestrator(project_root)
    
    # Executa o diagnóstico absoluto que agora inclui a automobiliização
    report_path = orchestrator.generate_full_diagnostic()
    
    logger.info(f"✅ Diagnóstico 360º concluído.")
    logger.info(f"📄 Relatório consolidado em: {report_path.name}")

if __name__ == "__main__":
    main()
