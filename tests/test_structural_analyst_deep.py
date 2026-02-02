
import unittest
import ast
from pathlib import Path
from src.agents.Support.structural_analyst import StructuralAnalyst

class TestStructuralAnalystDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Analista Estrutural 🏗️"""

    def setUp(self):
        self.analyst = StructuralAnalyst()

    def test_complexity_calculation(self):
        """Valida o cálculo de complexidade ciclomática baseada em AST."""
        code = """
def complex_func(x):
    if x > 0:
        for i in range(x):
            if i % 2 == 0:
                print(i)
            else:
                pass
    elif x < 0:
        while True:
            break
    return x
        """
        tree = ast.parse(code)
        # Ajuste para a nova API delegada
        complexity = self.analyst.parser.calculate_py_complexity(tree)
        # 1 (base) + 1 (if) + 1 (for) + 1 (if) + 1 (else/implicit) + 1 (elif) + 1 (while)
        # Nota: O calculador atual soma If, While, For, ExceptHandler, With e BoolOp.
        # No código: If (1), For (1), If (1), If (elif) (1), While (1) = 5 nodes + 1 base = 6
        self.assertEqual(complexity, 6)

    def test_import_extraction(self):
        """Valida extração de dependências de diversos tipos de import."""
        code = """
import os
import sys as system
from pathlib import Path
from src.core import orchestrator
        """
        tree = ast.parse(code)
        # Ajuste para a nova API delegada
        imports = self.analyst.parser.extract_py_imports(tree)
        self.assertIn("os", imports)
        self.assertIn("sys", imports)
        self.assertIn("pathlib", imports)
        self.assertIn("src.core", imports)

    def test_python_analysis_full(self):
        """Valida análise completa de um módulo Python."""
        code = "class MyClass:\n    def my_func(self): pass"
        result = self.analyst.analyze_python(code, "test.py")
        self.assertIn("MyClass", result["classes"])
        self.assertIn("my_func", result["functions"])
        self.assertEqual(result["complexity"], 1)

    def test_logic_flaw_detection(self):
        """Valida detecção de anti-padrões como exceções silenciosas."""
        code = """
try:
    do_something()
except Exception:
    pass
        """
        tree = ast.parse(code)
        lines = code.splitlines()
        issues = self.analyst.analyze_logic_flaws(tree, "dummy.py", lines, "TestAgent")
        self.assertEqual(len(issues), 1)
        self.assertIn("Captura de erro silenciosa", issues[0]["issue"])

    def test_component_mapping(self):
        """Valida classificação semântica de caminhos do projeto."""
        # Note: Analyst uses lower case internally now
        self.assertEqual(self.analyst.map_component_type("src/core/essential.py"), "CORE")
        self.assertEqual(self.analyst.map_component_type("src/agents/base.py"), "AGENT")
        self.assertEqual(self.analyst.map_component_type("tests/test_base.py"), "TEST")

    def test_maturity_metrics(self):
        """Valida detecção de maturidade via presença de padrões core."""
        content = "import time\ntime.time()\nPath('test')\nrules = []\ndef _reason_about_objective(): pass"
        metrics = self.analyst.calculate_maturity(content, "Python")
        self.assertTrue(metrics["has_telemetry"])
        self.assertTrue(metrics["has_reasoning"])
        self.assertTrue(metrics["has_pathlib"])
        self.assertTrue(metrics["is_linear_syntax"])

if __name__ == "__main__":
    unittest.main()
