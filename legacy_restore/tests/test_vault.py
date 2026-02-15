import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Strategic.vault import VaultPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestVault(unittest.TestCase):
    """
    Testes unitários para o especialista Vault.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Vault...")
        persona = VaultPersona(Path("."))
        self.assertEqual(persona.name, "Vault")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
