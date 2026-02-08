"""
🏁 Verificação Final de Integridade Sistêmica.
Este script executa uma análise 360º de última instância para garantir que 
nenhuma fragilidade residual ou 'Brittle Points' permaneçam nos domínios de produção.
"""
import logging
from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging
from pathlib import Path

# Configuração soberana de telemetria
configure_logging()
logger = logging.getLogger("FinalCheck")

def run_check():
    """Executa o protocolo de verificação final."""
    logger.info("📡 Iniciando protocolo Final Check...")
    orc = Orchestrator(Path('.'))
    ctx = orc.context_engine.analyze_project()
    diag = orc.get_system_health_360(ctx, {})

    logger.info(f"📊 Brittle count: {len(diag['brittle_points'])}")
    logger.info("📁 Detalhes dos pontos frágeis:")
    for f in diag['brittle_points']:
        info = ctx['map'].get(f, {})
        logger.info(f"  - {f} | Brittle: {info.get('brittle')} | Type: {info.get('component_type')}")
    logger.info("✅ Final Check concluído.")

if __name__ == "__main__":
    run_check()