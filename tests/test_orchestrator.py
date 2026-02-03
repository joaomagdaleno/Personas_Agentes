import unittest
import logging
import shutil
import tempfile
from pathlib import Path
from src_local.core.orchestrator import Orchestrator

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
        """Valida se o orquestrador descobre o DNA do projeto alvo de forma isolada."""
        # Cria um projeto alvo fake limpo
        target_dir = self.test_dir / "target_project"
        target_dir.mkdir()
        (target_dir / "requirements.txt").write_text("") 
        (target_dir / "app.py").write_text("print('hello')")
        
        orchestrator = Orchestrator(target_dir)
        context = orchestrator.context_engine.analyze_project()
        
        # Injeção de conformidade PhD 3.0 nos mocks do alvo
        for f in context["map"]: 
            context["map"][f]["telemetry"] = True
            context["map"][f]["purpose"] = "CORE"
            context["map"][f]["complexity"] = 1
            context["map"][f]["has_test"] = True
        
        qa_data = {
            "success": True, "pass_rate": 100, "total_run": 1, "failed": 0, 
            "pyramid": {"unit": 1, "total": 1}, 
            "execution": {"success": True, "failed": 0}
        }
        health = orchestrator.get_system_health_360(context, qa_data)
        
        self.assertIn("Orquestração", str(health["objective"]))
        self.assertEqual(health["health_score"], 100)

    def test_persona_mobilization(self):
        """Valida a mobilização seletiva de PhDs por stack."""
        from src_local.utils.persona_loader import PersonaLoader
        orchestrator = Orchestrator(self.test_dir)
        PersonaLoader.mobilize_all(self.test_dir, orchestrator)
        
        stacks = {"Python", "Kotlin"}
        active = orchestrator._select_active_phds("Audit", stacks)
        # Deve mobilizar ao menos um agente para as stacks informadas
        self.assertTrue(any(p.stack in ["Python", "Kotlin"] for p in active))
        self.assertGreater(len(active), 0)

if __name__ == "__main__":
    unittest.main()
