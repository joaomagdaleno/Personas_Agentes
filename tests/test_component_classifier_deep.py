import unittest
from src_local.agents.Support.component_classifier import ComponentClassifier

class TestComponentClassifierDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Classificador de Topologia 🗂️"""
    
    def setUp(self):
        self.classifier = ComponentClassifier()

    def test_core_mapping(self):
        self.assertEqual(self.classifier.map_type("src/core/essential.py"), "CORE")
        self.assertEqual(self.classifier.map_type("src/domain/entity.py"), "CORE")

    def test_agent_mapping(self):
        self.assertEqual(self.classifier.map_type("src/agents/base.py"), "AGENT")
        self.assertEqual(self.classifier.map_type("src/agents/Kotlin/probe.py"), "AGENT")

    def test_interface_mapping(self):
        self.assertEqual(self.classifier.map_type("src/interface/gui.py"), "INTERFACE")
        self.assertEqual(self.classifier.map_type("app/ui/main_screen.dart"), "INTERFACE")

    def test_logic_fallback(self):
        self.assertEqual(self.classifier.map_type("src/some_random_logic.py"), "LOGIC")
