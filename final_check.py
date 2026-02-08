import logging
from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging
from pathlib import Path

# Configuração soberana de telemetria
configure_logging()
logger = logging.getLogger("FinalCheck")

def run_check():
    orc = Orchestrator(Path('.'))
    ctx = orc.context_engine.analyze_project()
    diag = orc.get_system_health_360(ctx, {})

    logger.info(f"Brittle count: {len(diag['brittle_points'])}")
    logger.info("Files in brittle_points:")
    for f in diag['brittle_points']:
        info = ctx['map'].get(f, {})
        logger.info(f"- {f} | Brittle: {info.get('brittle')} | Type: {info.get('component_type')}")

if __name__ == "__main__":
    run_check()