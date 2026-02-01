import unittest
from src.agents.director import DirectorPersona

class TestDirectorPersona(unittest.TestCase):
    def setUp(self):
        self.director = DirectorPersona(project_root=".")

    def test_format_360_report(self):
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

if __name__ == "__main__":
    unittest.main()
