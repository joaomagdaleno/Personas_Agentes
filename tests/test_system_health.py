import unittest
import logging
from pathlib import Path
from src.core.orchestrator import Orchestrator

# Telemetria para testes
logger = logging.getLogger(__name__)

class TestSystemHealth(unittest.TestCase):
    """Auditoria PhD de Saúde do Sistema."""
    
    def setUp(self):
        self.project_root = Path(__file__).parent.parent
        self.orchestrator = Orchestrator(self.project_root)
        logger.info(f"Iniciando teste de saúde: {self._testMethodName}")

    def test_orchestrator_load(self):
        """Verifica se o orquestrador PhD carrega o DNA corretamente."""
        self.assertIsNotNone(self.orchestrator)
        logger.info("Orquestrador validado com sucesso.")

    def test_context_engine_dna(self):
        """Verifica se o ContextEngine descobre a missão de Orquestração."""
        context = self.orchestrator.context_engine.analyze_project()
        dna = context.get("identity", {})
        self.assertEqual(dna.get("core_mission"), "Orquestração de Inteligência Artificial")
        logger.info(f"DNA detectado: {dna.get('core_mission')}")

if __name__ == "__main__":
    unittest.main()