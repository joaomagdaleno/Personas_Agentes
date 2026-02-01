import unittest
import importlib

class TestPackageIntegrity(unittest.TestCase):
    """Garante que todos os pacotes e subpacotes do projeto são importáveis."""

    def test_imports(self):
        modules = [
            'src',
            'src.agents',
            'src.agents.Flutter',
            'src.agents.Kotlin',
            'src.agents.Python',
            'src.core',
            'src.interface',
            'src.utils'
        ]
        for mod in modules:
            with self.subTest(module=mod):
                try:
                    importlib.import_module(mod)
                except ImportError as e:
                    self.fail(f"Falha ao importar pacote {mod}: {e}")

if __name__ == "__main__":
    unittest.main()
