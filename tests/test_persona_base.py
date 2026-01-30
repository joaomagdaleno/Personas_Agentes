import unittest
import os
from persona_base import BaseActivePersona

class MockPersona(BaseActivePersona):
    """Classe mock para testar a base."""
    def perform_audit(self):
        return [{"issue": "test", "severity": "low"}]
    def get_system_prompt(self):
        return "Prompt"

class TestPersonaBase(unittest.TestCase):
    """Valida as funcionalidades core da classe base."""
    
    def setUp(self):
        """Inicializa com o diretório atual."""
        self.persona = MockPersona(".")

    def test_read_project_file_exists(self):
        """Testa a leitura de um arquivo existente (o próprio arquivo de base)."""
        content = self.persona.read_project_file("persona_base.py")
        self.assertIsNotNone(content)
        self.assertIn("class BaseActivePersona", content)

    def test_read_project_file_not_exists(self):
        """Testa o comportamento para arquivos inexistentes."""
        content = self.persona.read_project_file("arquivo_que_nao_existe.txt")
        self.assertIsNone(content)

if __name__ == "__main__":
    unittest.main()
