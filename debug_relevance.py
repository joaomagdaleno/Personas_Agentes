"""
🛠️ Utilitário de Debug: Relevância de Arquivos.
Este script valida a lógica de filtragem do IntegrityGuardian, garantindo que
apenas arquivos pertinentes a cada stack sejam processados durante as auditorias.
"""
import logging
from src_local.agents.Support.integrity_guardian import IntegrityGuardian

# Configuração de telemetria
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("DebugRelevance")

guardian = IntegrityGuardian()

files = [
    "src_local/agents/Flutter/echo.py",
    "src_local/agents/Flutter/metric.py",
    "forensic_env_24840/upstream_repo/core.py",
    "lib/main.dart",
    "pubspec.yaml"
]

stacks = ["Flutter", "Python", "Universal"]

logger.info("📡 Iniciando verificação de relevância de arquivos...")
for stack in stacks:
    logger.info(f"🔹 Stack: {stack}")
    for f in files:
        rel = guardian.is_relevant_file(f, stack)
        logger.info(f"  📄 {f}: {'RELEVANTE' if rel else 'IGNORADO'}")
logger.info("✅ Verificação de relevância concluída.")
