import unittest
import logging
from pathlib import Path
from src.agents.Python.scope import ScopePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestScope(unittest.TestCase):
    """
    Testes unitários para o especialista Scope.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Scope...")
        persona = ScopePersona(Path("."))
        self.assertEqual(persona.name, "Scope")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()