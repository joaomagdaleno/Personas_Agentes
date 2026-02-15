import unittest
import logging
from src_local.agents.Support.component_classifier import ComponentClassifier

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestComponentClassifierDeep")

class TestComponentClassifierDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Classificador de Topologia 🗂️"""
    
    def setUp(self):
        self.classifier = ComponentClassifier()

    def test_core_mapping(self):
        logger.info("⚡ Testando mapeamento CORE...")
        self.assertEqual(self.classifier.map_type("src/core/essential.py"), "CORE")
        self.assertEqual(self.classifier.map_type("src/domain/entity.py"), "CORE")
        logger.info("✅ Mapeamento CORE validado.")

    def test_agent_mapping(self):
        logger.info("⚡ Testando mapeamento AGENT...")
        self.assertEqual(self.classifier.map_type("src/agents/base.py"), "AGENT")
        self.assertEqual(self.classifier.map_type("src/agents/Kotlin/probe.py"), "AGENT")
        logger.info("✅ Mapeamento AGENT validado.")

    def test_interface_mapping(self):
        logger.info("⚡ Testando mapeamento INTERFACE...")
        self.assertEqual(self.classifier.map_type("src/interface/gui.py"), "INTERFACE")
        self.assertEqual(self.classifier.map_type("app/ui/main_screen.dart"), "INTERFACE")
        logger.info("✅ Mapeamento INTERFACE validado.")

    def test_logic_fallback(self):
        logger.info("⚡ Testando fallback para LOGIC...")
        self.assertEqual(self.classifier.map_type("src/some_random_logic.py"), "LOGIC")
        logger.info("✅ Fallback LOGIC validado.")
