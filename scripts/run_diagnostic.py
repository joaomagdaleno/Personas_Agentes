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
        target_path = Path(sys.argv[1]).absolute()
    else:
        target_path = Path.cwd()
    
    if not target_path.exists():
        logger.error(f"❌ Caminho não encontrado: {target_path}")
        return

    # Se o alvo for um arquivo, a raiz do projeto é o pai. 
    # Idealmente procuraríamos por .git, mas o pai é um fallback seguro aqui.
    if target_path.is_file():
        project_root = target_path.parent
        # Se estivermos dentro de /scripts, a raiz é o pai de /scripts
        if project_root.name == "scripts":
            project_root = project_root.parent
    else:
        project_root = target_path

    logger.info(f"📡 Acionando Autoconsciência sobre o alvo: {target_path}")
    logger.info(f"📁 Raiz do Projeto identificada: {project_root}")
    
    # O Orquestrador agora é autossuficiente e carrega seus próprios PhDs
    orchestrator = Orchestrator(project_root)
    
    # Passa o alvo específico se for diferente da raiz
    if target_path != project_root:
        orchestrator.last_detected_changes = [str(target_path.relative_to(project_root))]
    
    # Executa o diagnóstico absoluto que agora inclui a automobiliização
    report_path = orchestrator.generate_full_diagnostic()
    
    logger.info(f"✅ Diagnóstico 360º concluído.")
    logger.info(f"📄 Relatório consolidado em: {report_path.name}")

if __name__ == "__main__":
    main()
