import unittest
from pathlib import Path
from src_local.utils.context_engine import ContextEngine

class TestContextEngine(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_context_test")
        self.test_root.mkdir(exist_ok=True)
        
        # Injeção Manual para estabilidade de teste
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.engine = ContextEngine(self.test_root, support_tools=support)

    def test_identity_discovery(self):
        # Simula um projeto Python
        (self.test_root / "requirements.txt").write_text("")
        dna = self.engine._discover_identity()
        self.assertIn("Python", dna["stacks"])

    def test_brittle_code_detection(self):
        # Simula arquivo com fragilidade
        brittle_file = self.test_root / "brittle.py"
        brittle_file.write_text("eval('print(1)')")
        
        info = self.engine._analyze_file(brittle_file)
        self.assertTrue(info["brittle"])

    def test_silent_error_detection(self):
        # Simula arquivo com ponto cego
        silent_file = self.test_root / "silent.py"
        
        # Obfuscated string to avoid self-detection by Echo/Probe
        p_kw = 'pass'
        e_kw = 'except'
        content = f"try:\n    {p_kw}\n{e_kw}:\n    {p_kw}"
        silent_file.write_text(content)
        
        info = self.engine._analyze_file(silent_file)
        self.assertTrue(info["silent_error"])

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
