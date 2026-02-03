import unittest
from src_local.agents.Support.source_code_parser import SourceCodeParser

class TestSourceCodeParserDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Motor de Parsing 🔍"""
    
    def setUp(self):
        self.parser = SourceCodeParser()

    def test_python_parsing(self):
        """Valida extração de classes e funções Python."""
        code = "class MyClass:\n    def my_func(self): pass"
        data = self.parser.analyze_py(code)
        self.assertIn("MyClass", data["classes"])
        self.assertIn("my_func", data["functions"])
        self.assertIsNotNone(data["tree"])

    def test_kotlin_parsing(self):
        """Valida extração de classes e funções Kotlin."""
        code = "import com.test\nclass MainScreen {\n    fun render() {}\n}"
        data = self.parser.analyze_kt(code)
        self.assertIn("MainScreen", data["classes"])
        self.assertIn("render", data["functions"])
        self.assertIn("com.test", data["imports"])

    def test_complexity_calculation(self):
        """Valida cálculo de complexidade ciclomática."""
        # Kotlin
        code_kt = "if (a) { for (i in 1..10) { when(x) { 1 -> {} } } }"
        complexity = self.parser.calculate_kt_complexity(code_kt)
        self.assertGreater(complexity, 1)
        
        # Python
        import ast
        code_py = "if a: \n  for i in x: pass"
        tree = ast.parse(code_py)
        complexity_py = self.parser.calculate_py_complexity(tree)
        self.assertEqual(complexity_py, 3) # 1 base + 1 if + 1 for
