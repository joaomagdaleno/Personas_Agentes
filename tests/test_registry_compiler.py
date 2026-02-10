import unittest
import logging
from src_local.agents.Support.registry_compiler import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestRegistryCompiler")

class TestRegistrycompiler(unittest.TestCase):
    def test_compile_stacks_logic(self):
        """Valida a compilação do registro de agentes."""
        logger.info("⚡ Testando compilação de registro...")
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            agents_dir = Path(tmp_dir)
            python_dir = agents_dir / "Python"
            python_dir.mkdir()
            (python_dir / "agent_one.py").touch()
            (python_dir / "__init__.py").touch()
            
            compiler = RegistryCompiler()
            registry, total = compiler.compile_stacks(agents_dir)
            
            self.assertEqual(total, 1)
            self.assertIn("Python", registry["stacks"])
            self.assertEqual(registry["stacks"]["Python"][0]["name"], "agent_one")
            
        logger.info("✅ Compilação de registro validada.")

if __name__ == "__main__":
    unittest.main()
