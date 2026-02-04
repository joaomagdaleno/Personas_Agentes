import unittest
from src_local.agents.Python.sentinel import SentinelPersona

class TestSentinelPersona(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o Agente Sentinel."""

    def setUp(self):
        self.agent = SentinelPersona("mock_root")

    def test_security_audit_logic(self):
        """Valida a detecção de vulnerabilidades de injeção."""
        # Ofuscação de proteção para o próprio Sentinel não se auto-detectar
        danger_exec = "eval('1+1')"
        content = f"def run(): {danger_exec}"
        
        self.agent.set_context({
            "identity": {},
            "map": {"app.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        res = self.agent.perform_strategic_audit(file_target="app.py", content_target=content)
        self.assertEqual(len(res), 1)
        self.assertIn("Vulnerabilidade", res[0])

if __name__ == "__main__":
    unittest.main()
