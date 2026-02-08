import unittest
import logging
from src_local.agents.Python.bolt import BoltPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestBoltPersona")

class TestBoltPersona(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o Agente Bolt."""

    def setUp(self):
        self.agent = BoltPersona("mock_root")

    def test_performance_audit_logic(self):
        """Valida a detecção de gargalos de performance."""
        logger.info("⚡ Testando lógica de auditoria de performance...")
        content = "while True: pass"
        
        self.agent.set_context({
            "identity": {},
            "map": {"loop.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        res = self.agent.perform_strategic_audit(file_target="loop.py", content_target=content)
        self.assertEqual(len(res), 1)
        self.assertIn("Gargalo", res[0])
        logger.info("✅ Detecção de performance validada.")

if __name__ == "__main__":
    unittest.main()
