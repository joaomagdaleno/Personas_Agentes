import unittest
import os
import json
from compiler import RegistryCompiler

class TestRegistryCompiler(unittest.TestCase):
    def test_init(self):
        compiler = RegistryCompiler()
        self.assertIsNotNone(compiler.registry)
        self.assertIn("Director", compiler.registry)

    def test_load_persona_invalid(self):
        compiler = RegistryCompiler()
        persona = compiler.load_persona_from_file("non_existent.py")
        self.assertIsNone(persona)

if __name__ == "__main__":
    unittest.main()
