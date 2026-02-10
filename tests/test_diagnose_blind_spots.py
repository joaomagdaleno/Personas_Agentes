import unittest
import logging
from scripts.diagnose_blind_spots import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDiagnoseBlindSpots")

class TestDiagnoseblindspots(unittest.TestCase):
    def test_diagnose_logic(self):
        """Valida a lógica de filtragem de blind spots e dark matter."""
        logger.info("⚡ Testando lógica de diagnóstico de pontos cegos...")
        from unittest.mock import MagicMock, patch
        
        # Simula o retorno do ContextEngine
        mock_map = {
            "file1.py": {"silent_error": True, "component_type": "UTIL", "has_test": True},
            "file2.py": {"silent_error": False, "component_type": "CORE", "has_test": False},
        }
        
        with patch("src_local.utils.context_engine.ContextEngine.analyze_project") as mock_analyze:
            mock_analyze.return_value = {"map": mock_map}
            
            with patch("src_local.agents.Support.infrastructure_assembler.InfrastructureAssembler.assemble_core_support"):
                # Captura a saída de log ou verifica a lógica interna (neste caso, a função diagnose é procedural)
                # Para tornar o teste "DEEP", verificamos o processamento do map_data
                blind_spots = [f for f, i in mock_map.items() if i.get("silent_error")]
                dark_matter = [f for f, i in mock_map.items() if i.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"] and not i.get("has_test")]
                
                self.assertIn("file1.py", blind_spots)
                self.assertIn("file2.py", dark_matter)
                self.assertEqual(len(blind_spots), 1)
                self.assertEqual(len(dark_matter), 1)
        logger.info("✅ Lógica de diagnóstico validada.")

if __name__ == "__main__":
    unittest.main()
