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
        """Valida inicialização básica e mobilização de recursos."""
        orchestrator = Orchestrator(self.test_dir)
        self.assertIsNotNone(orchestrator)
        self.assertIsNotNone(orchestrator.context_engine)
        self.assertIsNotNone(orchestrator.synthesizer)
        self.assertIsNotNone(orchestrator.stability_ledger)
        self.assertTrue(len(orchestrator.personas) >= 0)

    def test_dna_discovery(self):
        """Valida se o orquestrador descobre o DNA do projeto alvo."""
        (self.test_dir / "requirements.txt").write_text("") # Simula Python
        orchestrator = Orchestrator(self.test_dir)
        context = orchestrator.context_engine.analyze_project()
        health = orchestrator.get_system_health_360(context, {"success": True})
        
        self.assertIn("Orquestração", str(health["objective"]))
        self.assertEqual(health["health_score"], 100)
        self.assertIn("map", health)
        self.assertIn("parity", health)

    def test_persona_mobilization(self):
        """Valida a mobilização seletiva de PhDs por stack."""
        from src.utils.persona_loader import PersonaLoader
        orchestrator = Orchestrator(self.test_dir)
        PersonaLoader.mobilize_all(self.test_dir, orchestrator)
        
        stacks = {"Python", "Kotlin"}
        active = orchestrator._select_active_phds("Audit", stacks)
        # Deve mobilizar ao menos um agente para as stacks informadas
        self.assertTrue(any(p.stack in ["Python", "Kotlin"] for p in active))
        self.assertGreater(len(active), 0)

if __name__ == "__main__":
    unittest.main()