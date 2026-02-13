import unittest
from unittest.mock import MagicMock, patch, mock_open
from pathlib import Path
from src_local.agents.Support.healer import HealerPersona

class TestHealerPersona(unittest.TestCase):
    def setUp(self):
        self.project_root = Path("/tmp/test_project")
        self.healer = HealerPersona(self.project_root)
        # Fix: Mock 'brain' attribute, not 'cognitive'
        self.healer.brain = MagicMock()

    def test_heal_finding_no_file(self):
        """Testa se falha graciosamente quando arquivo não existe."""
        finding = {"file": "non_existent.py", "issue": "Syntax Error"}
        # Mock full path check
        with patch.object(Path, "exists", return_value=False):
            result = self.healer.heal_finding(finding)
            self.assertFalse(result)

    def test_heal_finding_success(self):
        """Testa fluxo de cura com sucesso."""
        finding = {"file": "broken.py", "issue": "Fix me"}
        content = "def foo():\n    broken_code()"
        patched_content = "def foo():\n    fixed_code()"
        
        # Mock interactions
        with patch.object(Path, "exists", return_value=True), \
             patch.object(Path, "read_text", return_value=content), \
             patch.object(Path, "write_text") as mock_write, \
             patch.object(Path, "rename") as mock_rename:
            
            # Mock LLM response
            self.healer.brain.reason.return_value = f"```python\n{patched_content}\n```"
            
            result = self.healer.heal_finding(finding)
            
            self.assertTrue(result)
            mock_rename.assert_called() # Should backup
            mock_write.assert_called_with(patched_content, encoding="utf-8")

    def test_heal_finding_llm_failure(self):
        """Testa falha quando LLM não retorna código válido."""
        finding = {"file": "broken.py", "issue": "Fix me"}
        
        with patch.object(Path, "exists", return_value=True), \
             patch.object(Path, "read_text", return_value="content"):
            
            self.healer.brain.reason.return_value = "No code here"
            
            result = self.healer.heal_finding(finding)
            
            self.assertFalse(result)

if __name__ == "__main__":
    unittest.main()
