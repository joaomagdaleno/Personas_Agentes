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

    def test_stage_detection(self):
        """Valida se o orquestrador detecta o estágio do projeto."""
        orchestrator = Orchestrator(self.test_dir)
        stage = orchestrator.detect_stage()
        self.assertIn(stage, ["GENESIS", "EVOLUTION", "STABILITY"])
        logger.info(f"✅ Estágio detectado: {stage}")

if __name__ == "__main__":
    unittest.main()