import unittest
import logging
from pathlib import Path
from src_local.utils.context_engine import ContextEngine

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestContextEngineSystem")

class TestContextEngine(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_context_test")
        self.test_root.mkdir(exist_ok=True)
        
        # Injeção Manual para estabilidade de teste
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.engine = ContextEngine(self.test_root, support_tools=support)

    def test_identity_discovery(self):
        logger.info("⚡ Testando descoberta de identidade...")
        # Simula um projeto Python
        (self.test_root / "requirements.txt").write_text("")
        dna = self.engine._discover_identity()
        self.assertIn("Python", dna["stacks"])
        logger.info("✅ Identidade validada.")

    def test_brittle_code_detection(self):
        logger.info("⚡ Testando detecção de código frágil...")
        # Simula arquivo com fragilidade
        brittle_file = self.test_root / "brittle.py"
        brittle_file.write_text("eval('print(1)')")
        
        self.engine._register_file(brittle_file, ignore_test_context=True)
        # O motor armazena chaves no formato POSIX relativo à raiz do projeto
        info = self.engine.map.get("brittle.py")
        self.assertIsNotNone(info, "Arquivo não registrado no mapa")
        self.assertTrue(info["brittle"])
        logger.info("✅ Código frágil detectado.")

    def test_silent_error_detection(self):
        logger.info("⚡ Testando detecção de erro silenciado...")
        # Simula arquivo com ponto cego
        logic_file = self.test_root / "app_logic.py"
        
        # Obfuscated string to avoid self-detection by Echo/Probe
        p_kw = 'pass'
        e_kw = 'except'
        content = f"try:\n    {p_kw}\n{e_kw}:\n    {p_kw}"
        logic_file.write_text(content)
        
        self.engine._register_file(logic_file, ignore_test_context=True)
        info = self.engine.map.get("app_logic.py")
        self.assertIsNotNone(info, "Arquivo não registrado no mapa")
        self.assertTrue(info["silent_error"])
        logger.info("✅ Erro silenciado detectado.")

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
