import unittest
import os
import sys

# Adiciona a raiz ao path
sys.path.append(os.getcwd())

from src.core.orchestrator import ProjectOrchestrator
from src.agents.director import DirectorPersona

class TestSystemIntegrity(unittest.TestCase):
    def test_director_initialization(self):
        """Verifica se o Diretor (Core) inicializa corretamente."""
        director = DirectorPersona()
        self.assertEqual(director.name, "Director")
        self.assertIsNotNone(director.get_system_prompt())

    def test_orchestrator_stack_detection(self):
        """Verifica se o orquestrador identifica o estágio do projeto."""
        # Usa o próprio repositório como alvo de teste
        orch = ProjectOrchestrator(os.getcwd())
        stage = orch.detect_stage()
        self.assertIn(stage, ["GENESIS", "EVOLUTION", "STABILITY"])

    def test_agent_loading_python(self):
        """Verifica se os agentes Python podem ser instanciados."""
        agent_path = os.path.join("src", "agents", "Python", "bolt.py")
        if os.path.exists(agent_path):
            from src.agents.Python.bolt import BoltPersona
            bolt = BoltPersona(os.getcwd())
            self.assertEqual(bolt.name, "Bolt")
            self.assertEqual(bolt.emoji, "⚡")

if __name__ == '__main__':
    unittest.main()
