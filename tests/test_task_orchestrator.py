import unittest
import logging
from unittest.mock import MagicMock
from src_local.core.task_orchestrator import *


# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTask_orchestrator")

class TestTaskorchestrator(unittest.TestCase):
    def test_select_active_phds(self):
        """Valida a lógica de seleção de PhDs baseada em stack e criticidade."""
        logger.info("⚡ Testando seleção de PhDs ativos...")
        mock_orc = MagicMock()
        orchestrator = TaskOrchestrator(mock_orc)
        
        class MockPersona:
            _reason_about_objective = "base"
            def __init__(self, name, stack):
                self.name = name
                self.stack = stack
        
        personas = [
            MockPersona("PythonExpert", "Python"),
            MockPersona("FlutterExpert", "Flutter"),
            MockPersona("UniversalExpert", "Universal")
        ]
        
        # Objetivo comum em stack Python
        active = orchestrator.select_active_phds("Refatorar código", ["Python"], personas)
        names = [p.name for p in active]
        self.assertIn("PythonExpert", names)
        self.assertIn("UniversalExpert", names)
        self.assertNotIn("FlutterExpert", names)
        logger.info("✅ Seleção de stack validada.")

    def test_run_targeted_verification(self):
        """Valida a verificação cirúrgica de arquivos."""
        logger.info("⚡ Testando verificação cirúrgica...")
        mock_orc = MagicMock()
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            mock_orc.project_root = tmp_path
            (tmp_path / "target.py").write_text("print('test')", encoding='utf-8')
            
            mock_agent = MagicMock()
            mock_agent.name = "Expert"
            mock_agent.perform_strategic_audit.return_value = ["Finding"]
            mock_orc.personas = [mock_agent]
            
            orchestrator = TaskOrchestrator(mock_orc)
            results = orchestrator.run_targeted_verification({"target.py": ["Expert"]})
            
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0], "Finding")
            logger.info("✅ Verificação cirúrgica validada.")

if __name__ == "__main__":
    unittest.main()
