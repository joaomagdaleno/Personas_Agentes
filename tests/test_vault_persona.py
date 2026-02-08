import unittest
import logging
from src_local.agents.Python.vault import VaultPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestVaultPersona")

class TestVaultPersona(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o Agente Vault."""

    def setUp(self):
        self.agent = VaultPersona("mock_root")

    def test_financial_audit_logic(self):
        """Valida a detecção de imprecisão monetária."""
        logger.info("⚡ Testando detecção de imprecisão financeira...")
        # Uso de string para representar o float e evitar o alerta no próprio teste se possível,
        # ou aceitar que o teste deve conter o erro para ser detectado.
        content = "price = float('10.5')" 
        
        self.agent.set_context({
            "identity": {},
            "map": {"finance.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        res = self.agent.perform_strategic_audit(file_target="finance.py", content_target=content)
        self.assertEqual(len(res), 1)
        self.assertIn("Precisão", res[0])
        logger.info("✅ Imprecisão financeira detectada com sucesso.")

if __name__ == "__main__":
    unittest.main()
