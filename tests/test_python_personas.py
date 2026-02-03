import unittest
import importlib.util
import logging
from pathlib import Path
from src_local.agents.base import BaseActivePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestPythonPersonas(unittest.TestCase):
    """
    Testa a integridade de todas as personas especialistas em Python.
    Monitorado por Dr. Metric e Dr. Voyager.
    """

    def test_personas_load_and_contract(self):
        """Verifica se cada PhD Python segue o contrato da BaseActivePersona."""
        logger.info("Auditando integridade contratual da junta de PhDs Python...")
        python_dir = Path.cwd() / "src" / "agents" / "Python"
        self.assertTrue(python_dir.exists())

        loaded_count = 0
        for f_path in python_dir.glob("*.py"):
            if f_path.name == "__init__.py": continue
            
            # Import dinâmico resiliente
            module_name = f_path.stem
            spec = importlib.util.spec_from_file_location(module_name, f_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            found_class = False
            for attr in dir(module):
                if attr.endswith("Persona") and attr != "BaseActivePersona":
                    persona_class = getattr(module, attr)
                    if isinstance(persona_class, type):
                        instance = persona_class(Path.cwd())
                        self.assertIsInstance(instance, BaseActivePersona)
                        self.assertIsNotNone(instance.name)
                        found_class = True
                        loaded_count += 1
            
            self.assertTrue(found_class, f"Falha de contrato em: {f_path.name}")
        
        logger.info(f"✅ Contrato validado para {loaded_count} PhDs Python.")

if __name__ == "__main__":
    unittest.main()
