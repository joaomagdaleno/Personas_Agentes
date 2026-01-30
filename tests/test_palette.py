import unittest
from src.agents.Python.palette import PalettePersona

class TestPalette(unittest.TestCase):
    """Testes unitários para o especialista Palette."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = PalettePersona(".")
        self.assertEqual(persona.name, "Palette")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
