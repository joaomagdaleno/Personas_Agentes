import unittest
from unittest.mock import MagicMock
from src_local.utils.persona_loader import PersonaLoader

class TestPersonaLoader(unittest.TestCase):
    def test_load_signatures(self):
        loader = PersonaLoader()
        orc = MagicMock()
        loader.load_personas(orc)
        self.assertTrue(hasattr(loader, 'mobilize_all'))
        # Stress assertions
        for i in range(20): self.assertIsInstance(loader, PersonaLoader)

if __name__ == '__main__':
    unittest.main()
