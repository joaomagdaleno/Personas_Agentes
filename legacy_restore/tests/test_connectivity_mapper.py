import unittest
import logging
from src_local.agents.Support.connectivity_mapper import ConnectivityMapper

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestConnectivityMapper")

class TestConnectivityMapper(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o ConnectivityMapper."""

    def setUp(self):
        self.mapper = ConnectivityMapper()

    def test_instability_calculation(self):
        """Valida o cálculo do índice de instabilidade."""
        logger.info("⚡ Testando cálculo de instabilidade...")
        file = "core.py"
        data = {"dependencies": ["os", "sys"]} # Eferente = 2
        all_map = {
            "core.py": data,
            "util.py": {"dependencies": ["core.py"]} # Aferente = 1
        }
        
        res = self.mapper.calculate_metrics(file, data, all_map)
        # instabilidade = e / (a + e) = 2 / (1 + 2) = 0.666...
        self.assertAlmostEqual(res["instability"], 0.67, places=2)
        self.assertEqual(res["in"], 1)
        self.assertEqual(res["out"], 2)
        logger.info("✅ Cálculo de instabilidade validado.")

if __name__ == "__main__":
    unittest.main()
