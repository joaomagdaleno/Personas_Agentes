import unittest
import logging
import os
import sys
from pathlib import Path

# Injeção de caminho para garantir que debug_brittle.py seja encontrado se estiver no root
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDebugBrittle")

class TestDebugBrittle(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for debug_brittle.py"""
        logger.info("⚡ Iniciando smoke test para debug_brittle.py...")
        # Apenas verifica se o arquivo existe e pode ser importado (estático)
        # Não executamos o main() para evitar o loop de diagnóstico durante o teste
        try:
            import debug_brittle
            self.assertTrue(hasattr(debug_brittle, 'main'))
            logger.info("✅ Importação de debug_brittle.py validada.")
        except ImportError as e:
            self.fail(f"Falha ao importar debug_brittle.py: {e}")
        
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
