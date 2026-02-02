
import logging
import sys
import shutil
import time
from pathlib import Path

# Adiciona o diretório raiz ao sys.path para acessar src
sys.path.append(str(Path(__file__).parent.parent))

from src.core.orchestrator import Orchestrator
from src.utils.logging_config import configure_logging

def main():
    """
    🕵️ SISTEMA DE PERSONAS AGENTES: AUDITORIA DE TERRITÓRIO ESTRANGEIRO
    Finalidade: Analisar projetos externos utilizando o poder da junta de PhDs.
    Uso: python scripts/analyze_external.py [caminho_do_projeto]
    """
    configure_logging()
    logger = logging.getLogger("TerritoryAuditor")
    
    if len(sys.argv) < 2:
        logger.error("❌ Erro: Caminho do alvo não fornecido.")
        logger.info("Uso: python scripts/analyze_external.py <caminho_do_projeto>")
        return

    target_path = Path(sys.argv[1]).absolute()
    if not target_path.exists():
        logger.error(f"❌ Erro: Alvo não encontrado em {target_path}")
        return

    logger.info(f"🛰️ Projetando Autoconsciência PhD sobre o alvo: {target_path.name}")
    logger.info(f"📂 Localização: {target_path}")

    # Inicializa o Orquestrador apontando para o território externo
    # As personas serão carregadas do nosso sistema, mas atuarão no alvo.
    orchestrator = Orchestrator(target_path)
    
    start_time = time.time()
    
    # Gera o diagnóstico absoluto
    # Nota: O Orquestrador salvará o relatório original dentro do alvo
    report_path = orchestrator.generate_full_diagnostic()
    
    # Customização: Trazer o relatório para a nossa base com nome identificador
    local_report_name = f"audit_{target_path.name.lower()}_{time.strftime('%Y%m%d')}.md"
    local_report_path = Path.cwd() / local_report_name
    
    try:
        shutil.copy(report_path, local_report_path)
        logger.info(f"✅ Auditoria de Território concluída em {time.time() - start_time:.2f}s.")
        logger.info(f"📄 Relatório Soberano consolidado em: {local_report_name}")
    except Exception as e:
        logger.error(f"⚠️ Falha ao mover relatório localmente: {e}")
        logger.info(f"📄 O relatório original está em: {report_path}")

if __name__ == "__main__":
    main()
