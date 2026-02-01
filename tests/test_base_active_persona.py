import unittest
from src.agents.base import BaseActivePersona

class MockPersona(BaseActivePersona):
    def perform_audit(self):
        return []
    def _reason_about_objective(self, objective, file, content):
        return None
    def get_system_prompt(self):
        return "System Prompt"

class TestBaseActivePersona(unittest.TestCase):
    def setUp(self):
        self.persona = MockPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.persona.name, "Base")
        self.assertEqual(self.persona.stack, "Universal")

    def test_context_setting(self):
        context = {"identity": {"core_mission": "Test"}, "map": {"file.py": {}}}
        self.persona.set_context(context)
        self.assertEqual(self.persona.project_dna.get("core_mission"), "Test")

if __name__ == "__main__":
    unittest.main()
