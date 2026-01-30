import unittest
from director_persona import DirectorPersona

class TestDirectorPersona(unittest.TestCase):
    """Testa a persona do Diretor."""
    
    def test_prompt_structure(self):
        """Garante que o prompt do diretor contém sua missão e nome."""
        director = DirectorPersona()
        prompt = director.get_system_prompt()
        self.assertIn("Director", prompt)
        self.assertIn("orchestrate", prompt.lower())

    def test_audit_empty(self):
        """O Diretor não deve encontrar problemas técnicos em auditorias estáticas por padrão."""
        director = DirectorPersona()
        self.assertEqual(director.perform_audit(), [])

if __name__ == "__main__":
    unittest.main()
