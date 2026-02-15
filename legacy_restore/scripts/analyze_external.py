
import logging
import sys
import shutil
import time
from pathlib import Path

# Adiciona o diretório raiz ao sys.path para acessar src
sys.path.append(str(Path(__file__).parent.parent))

from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging

def main():
    """
    🕵️ Auditor de Território Estrangeiro.
    Projeta a consciência coletiva da junta de PhDs sobre projetos externos,
    mapeando o DNA e a saúde técnica de territórios além das fronteiras do sistema.
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
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "✅ Auditoria de Território concluída", level=logging.INFO)
        logger.info(f"📄 Relatório Soberano consolidado em: {local_report_name}")
    except Exception as e:
        logger.error(f"⚠️ Falha ao mover relatório localmente: {e}")
        logger.info(f"📄 O relatório original está em: {report_path}")

if __name__ == "__main__":
    main()
