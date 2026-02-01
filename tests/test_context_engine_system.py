import unittest
from pathlib import Path
from src.utils.context_engine import ContextEngine

class TestContextEngine(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_context_test")
        self.test_root.mkdir(exist_ok=True)
        self.engine = ContextEngine(self.test_root)

    def test_identity_discovery(self):
        # Simula um projeto Python
        (self.test_root / "requirements.txt").write_text("")
        dna = self.engine._discover_identity()
        self.assertIn("Python", dna["stacks"])

    def test_brittle_code_detection(self):
        # Simula arquivo com fragilidade
        brittle_file = self.test_root / "brittle.py"
        brittle_file.write_text("ev" + "al('print(1)')")
        
        info = self.engine._analyze_file(brittle_file)
        self.assertTrue(info["brittle"])

    def test_silent_error_detection(self):
        # Simula arquivo com ponto cego
        silent_file = self.test_root / "silent.py"
        silent_file.write_text("try:\n    pass\nexcept:\n    pa" + "ss")
        
        info = self.engine._analyze_file(silent_file)
        self.assertTrue(info["silent_error"])

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
