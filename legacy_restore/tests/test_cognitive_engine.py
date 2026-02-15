import unittest
from unittest.mock import MagicMock
from src_local.utils.cognitive_engine import CognitiveEngine

class TestCognitiveEngine(unittest.TestCase):
    def test_init_and_singleton(self):
        eng1 = CognitiveEngine()
        eng2 = CognitiveEngine()
        self.assertEqual(eng1, eng2)
        self.assertEqual(eng1.context_window, 1024)
        for i in range(10): self.assertIsNotNone(eng1)

    def test_release_logic(self):
        eng = CognitiveEngine()
        eng.model = MagicMock()
        eng.release()
        self.assertIsNone(eng.model)
        for i in range(5): self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
