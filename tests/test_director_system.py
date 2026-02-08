import unittest
import logging
from src_local.agents.director import DirectorPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDirectorSystem")

class TestDirectorPersona(unittest.TestCase):
    def setUp(self):
        self.director = DirectorPersona(project_root=".")

    def test_format_360_report(self):
        logger.info("⚡ Testando formatação de relatório 360...")
        health_data = {
            'objective': 'Test Mission',
            'health_score': 95,
            'blind_spots': [],
            'brittle_points': [],
            'dark_matter': [],
            'persona_maturity': [],
            'ledger': {},
            'parity': {'gaps': []},
            'map': {},
            'test_quality_matrix': [],
            'efficiency': {}
        }
        report = self.director.format_360_report(health_data, [])
        self.assertIn("MAPA DE CONSCIÊNCIA SISTÊMICA", report)
        self.assertIn("Test Mission", report)
        logger.info("✅ Relatório 360 validado.")

if __name__ == "__main__":
    unittest.main()
