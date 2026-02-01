import unittest
import logging
import shutil
import tempfile
from pathlib import Path
from src.core.orchestrator import Orchestrator

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestOrchestrator(unittest.TestCase):
    """
    Testes unitários para o Orquestrador PhD.
    Monitorado por Dr. Metric e Dr. Voyager.
    """
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        logger.info(f"Iniciando testes no Orquestrador: {self._testMethodName}")
        
    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)
        logger.info("Limpeza de ambiente de teste concluída.")

    def test_init(self):
        """Valida inicialização básica via Pathlib."""
        orchestrator = Orchestrator(self.test_dir)
        self.assertIsNotNone(orchestrator)
        logger.info("✅ Orquestrador inicializado via Pathlib.")

    def test_dna_discovery(self):
        """Valida se o orquestrador descobre o DNA do projeto alvo."""
        (self.test_dir / "requirements.txt").write_text("") # Simula Python
        orchestrator = Orchestrator(self.test_dir)
        context = orchestrator.context_engine.analyze_project()
        health = orchestrator.get_system_health_360(context, {"success": True})
        self.assertIn("Python", str(health["objective"]))

if __name__ == "__main__":
    unittest.main()