import unittest
import os
import importlib.util
from persona_base import BaseActivePersona

class TestPythonPersonas(unittest.TestCase):
    """Testa a integridade de todas as personas especialistas em Python."""

    def test_personas_load_and_contract(self):
        """Verifica se cada arquivo em Python/ implementa corretamente o contrato da BaseActivePersona."""
        python_dir = os.path.join(os.getcwd(), "Python")
        self.assertTrue(os.path.exists(python_dir))

        for filename in os.listdir(python_dir):
            if filename.endswith(".py") and "__init__" not in filename:
                f_path = os.path.join(python_dir, filename)
                
                # Import dinâmico
                module_name = filename.replace(".py", "")
                spec = importlib.util.spec_from_file_location(module_name, f_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Encontra a classe Persona
                found_class = False
                for attr in dir(module):
                    if attr.endswith("Persona") and attr not in ["BaseActivePersona", "BasePersona"]:
                        persona_class = getattr(module, attr)
                        if isinstance(persona_class, type):
                            # Tenta instanciar
                            instance = persona_class(".")
                            self.assertIsInstance(instance, BaseActivePersona)
                            
                            # Valida metadados
                            self.assertIsNotNone(instance.name)
                            self.assertIsNotNone(instance.get_system_prompt())
                            found_class = True
                
                self.assertTrue(found_class, f"Nenhuma classe Persona encontrada em {filename}")

if __name__ == "__main__":
    unittest.main()
