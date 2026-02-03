import unittest
import logging
from pathlib import Path
from src_local.core.compiler import Compiler

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestCompiler(unittest.TestCase):
    """
    Testes para o Sincronizador de Censo PhD.
    Monitorado por Dr. Metric e Dr. Voyager.
    """
    
    def test_registry_existence(self):
        """Valida a criação do agents_registry.json via Pathlib."""
        logger.info("Auditando persistência de registro PhD...")
        compiler = Compiler()
        compiler.compile_all()
        registry_path = Path("agents_registry.json")
        self.assertTrue(registry_path.exists())
        logger.info("✅ Registro persistido com sucesso.")

if __name__ == "__main__":
    unittest.main()
