import logging
import sys
import os
from pathlib import Path

# FBI MODE: Força o Python a ler os arquivos que eu estou editando AGORA.
current_dir = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(current_dir))
os.chdir(str(current_dir))

# Mata o fantasma do 'src' global
sys.modules['src'] = None

from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging

def main():
    """
    🌌 Portal de Consciência Sistêmica.
    O ponto de entrada soberano para o auto-exame e auditoria de territórios.
    Realiza o bootstrapping do Orquestrador e consolida a visão 360º.
    """
    configure_logging()
    logger = logging.getLogger("SystemMonitor")
    
    import time
    start_time = time.time()
    
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
