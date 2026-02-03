import unittest
import logging
from pathlib import Path
from src_local.agents.Python.metric import MetricPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestMetric(unittest.TestCase):
    """
    Testes unitários para o especialista Metric.
    Monitorado por si mesmo.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Metric...")
        persona = MetricPersona(Path("."))
        self.assertEqual(persona.name, "Metric")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
