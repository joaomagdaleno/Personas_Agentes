import unittest
from src_local.agents.Python.bolt import BoltPersona

class TestBoltPersona(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o Agente Bolt."""

    def setUp(self):
        self.agent = BoltPersona("mock_root")

    def test_performance_audit_logic(self):
        """Valida a detecção de gargalos de performance."""
        content = "while True: pass"
        
        self.agent.set_context({
            "identity": {},
            "map": {"loop.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        res = self.agent.perform_strategic_audit(file_target="loop.py", content_target=content)
        self.assertEqual(len(res), 1)
        self.assertIn("Gargalo", res[0])

if __name__ == "__main__":
    unittest.main()
