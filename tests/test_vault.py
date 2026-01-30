import unittest
from src.agents.Python.vault import VaultPersona

class TestVault(unittest.TestCase):
    """Testes unitários para o especialista Vault."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = VaultPersona(".")
        self.assertEqual(persona.name, "Vault")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
