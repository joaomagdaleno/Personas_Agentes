import unittest
from src_local.agents.Python.Strategic.sentinel import SentinelPersona

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
        
        # O Sentinel agora delega para o AuditEngine via find_patterns
        # Precisamos simular a leitura do arquivo no mock
        import logging
        logging.getLogger("src_local.agents.base").setLevel(logging.CRITICAL)
        
        # Mockando a leitura do arquivo
        self.agent.read_project_file = lambda x: content
        
        res = self.agent.perform_audit()
        self.assertEqual(len(res), 1)
        self.assertIn("RCE", res[0]['issue'])

if __name__ == "__main__":
    unittest.main()
