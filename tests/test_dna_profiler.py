import unittest
import logging
from src_local.agents.Support.dna_profiler import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDNAProfiler")

class TestDnaprofiler(unittest.TestCase):
    def test_discover_identity_logic(self):
        """Valida a detecção de stacks baseada em arquivos de assinatura."""
        logger.info("⚡ Testando perfilamento de DNA...")
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            project_root = Path(tmp_dir)
            (project_root / "pubspec.yaml").touch()
            (project_root / "requirements.txt").touch()
            
            profiler = DNAProfiler()
            dna = profiler.discover_identity(project_root)
            
            self.assertIn("Flutter", dna["stacks"])
            self.assertIn("Python", dna["stacks"])
            self.assertNotIn("Kotlin", dna["stacks"])
            self.assertEqual(dna["core_mission"], "Orquestração de Inteligência Artificial")
            
        logger.info("✅ Perfilamento de DNA validado.")

if __name__ == "__main__":
    unittest.main()
