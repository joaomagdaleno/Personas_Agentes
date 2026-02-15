import unittest
import importlib
import logging

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPackageIntegrity")

class TestPackageIntegrity(unittest.TestCase):
    """Garante que todos os pacotes e subpacotes do projeto são importáveis."""

    def test_imports(self):
        logger.info("⚡ Iniciando verificação de integridade de pacotes...")
        modules = [
            'src_local.agents',
            'src_local.agents.Flutter',
            'src_local.agents.Kotlin',
            'src_local.agents.Python',
            'src_local.core',
            'src_local.interface',
            'src_local.utils'
        ]
        for mod in modules:
            with self.subTest(module=mod):
                try:
                    importlib.import_module(mod)
                    logger.info(f"✅ Pacote {mod} importado com sucesso.")
                except ImportError as e:
                    logger.error(f"❌ Falha ao importar pacote {mod}: {e}")
                    self.fail(f"Falha ao importar pacote {mod}: {e}")
        logger.info("✅ Verificação de integridade concluída.")

if __name__ == "__main__":
    unittest.main()
