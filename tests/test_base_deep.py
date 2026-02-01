
import unittest
from pathlib import Path
from src.agents.base import BaseActivePersona

class MockPersona(BaseActivePersona):
    def perform_audit(self):
        return []
    def _reason_about_objective(self, objective, file, content):
        if "critical_error" in content:
            return f"Found error in {file} regarding {objective}"
        return None
    def get_system_prompt(self):
        return "System Prompt"

class TestBaseActivePersonaDeep(unittest.TestCase):
    """Bateria de Testes PhD para a Base de Personas Ativas 👤"""

    def setUp(self):
        self.project_root = Path("temp_base_test")
        self.project_root.mkdir(exist_ok=True)
        self.persona = MockPersona(project_root=self.project_root)

    def tearDown(self):
        import shutil
        if self.project_root.exists():
            shutil.rmtree(self.project_root)

    def test_initialization(self):
        self.assertEqual(self.persona.name, "Base")
        self.assertEqual(self.persona.emoji, "👤")

    def test_context_management(self):
        """Valida se o DNA e o Mapa são processados corretamente."""
        context = {
            "identity": {"core_mission": "Alpha Mission", "stacks": {"Python"}},
            "map": {"src/main.py": {"complexity": 10}}
        }
        self.persona.set_context(context)
        self.assertEqual(self.persona.project_dna["core_mission"], "Alpha Mission")
        self.assertIn("src/main.py", self.persona.context_data)

    def test_strategic_audit_flow(self):
        """Valida o fluxo de auditoria estratégica focada em objetivos."""
        self.persona.set_context({"map": {"src/danger.py": {}}})
        # Cria arquivo físico para leitura
        file_path = self.project_root / "src" / "danger.py"
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text("critical_error detected")
        
        issues = self.persona.perform_strategic_audit(objective="Safety")
        self.assertEqual(len(issues), 1)
        self.assertTrue("Found error" in issues[0])
        self.assertTrue(len(issues) > 0)

    def test_find_patterns_integration(self):
        """Valida a integração com o AuditEngine para varredura de padrões."""
        self.persona.set_context({"map": {"src/test.py": {}}})
        file_path = self.project_root / "src" / "test.py"
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text("ev" + "al(x)")
        
        patterns = [{'regex': r"eval\(", 'issue': 'Security Risk', 'severity': 'critical'}]
        issues = self.persona.find_patterns(extensions=(".py"), patterns=patterns)
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["issue"], "Security Risk")
        self.assertTrue("file" in issues[0])

    def test_ignored_files_logic(self):
        """Garante que arquivos sensíveis ou de relatório sejam ignorados."""
        self.persona.set_context({"map": {"auto_healing_mission.md": {}}})
        issues = self.persona.perform_strategic_audit()
        self.assertEqual(len(issues), 0)

if __name__ == "__main__":
    unittest.main()
