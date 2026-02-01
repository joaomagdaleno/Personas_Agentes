import unittest
from src.agents.director import DirectorPersona

class TestDirectorPersona(unittest.TestCase):
    def setUp(self):
        self.director = DirectorPersona(project_root=".")

    def test_format_mission_structure(self):
        metrics = {'start_time': 0, 'end_time': 1, 'health_score': 100}
        report = self.director.format_mission([], "STABILITY", metrics)
        self.assertIn("BRIEFING DE MISSÃO", report)
        self.assertIn("100% Saudável", report)

    def test_format_360_report(self):
        health_data = {
            'objective': 'Test Mission',
            'health_score': 95,
            'blind_spots': [],
            'brittle_points': [],
            'dark_matter': [],
            'persona_maturity': [],
            'ledger': {}
        }
        report = self.director.format_360_report(health_data, [])
        self.assertIn("DIAGNÓSTICO 360º", report)
        self.assertIn("Test Mission", report)

if __name__ == "__main__":
    unittest.main()
