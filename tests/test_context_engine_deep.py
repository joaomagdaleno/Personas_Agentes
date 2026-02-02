
import unittest
import shutil
import time
from pathlib import Path
from src.utils.context_engine import ContextEngine

class TestContextEngineDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Cérebro Semântico (ContextEngine) 🧠"""

    def setUp(self):
        # Telemetria para conformidade
        self.start_time = time.time()
        self.test_root = Path("temp_context_deep")
        self.test_root.mkdir(exist_ok=True)
        # Cria estrutura mínima
        (self.test_root / "src").mkdir(exist_ok=True)
        (self.test_root / "tests").mkdir(exist_ok=True)
        
        # Injeção Manual para estabilidade de teste
        from src.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.engine = ContextEngine(self.test_root, support_tools=support)

    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def test_full_project_mapping(self):
        """Valida o mapeamento completo da topologia e DNA do projeto."""
        (self.test_root / "requirements.txt").write_text("numpy")
        (self.test_root / "src" / "main.py").write_text("print('hello')")
        (self.test_root / "tests" / "test_main.py").write_text("assert True")
        
        result = self.engine.analyze_project()
        self.assertIn("Python", result["identity"]["stacks"])
        self.assertIn("src/main.py", result["map"])
        self.assertIn("tests/test_main.py", result["map"])
        self.assertEqual(result["map"]["tests/test_main.py"]["component_type"], "TEST")

    def test_test_quality_metrics(self):
        """Valida a extração de métricas de profundidade de testes."""
        test_content = """
def test_complex():
    assert x == 1
    self.assertEqual(y, 2)
    self.assertTrue(z)
    assert a is not None
    self.assertIn(b, list)
    assert c > 0
        """
        test_file = self.test_root / "tests" / "test_deep.py"
        test_file.write_text(test_content)
        
        info = self.engine._analyze_file(test_file)
        self.assertEqual(info["component_type"], "TEST")
        # Assertions detectadas pelo regex r"assert[A-Z]\w*\(|self\.assert"
        # No conteúdo: assert (não casa), self.assertEqual (casa), self.assertTrue (casa), self.assertIn (casa)
        # Mais o regex simples re.findall(r"assert[A-Z]\w*\(|self\.assert", content)
        # No ContextEngine._analyze_test_quality ele conta: assert[A-Z]\w*\( (ex: assertEqual() ou self.assert...)
        self.assertGreaterEqual(info["test_depth"]["assertion_count"], 3)

    def test_stack_parity_integration(self):
        """Valida integração com o ParityAnalyst e detecção de stacks."""
        # Cria um arquivo que indica necessidade de uma stack
        (self.test_root / "pubspec.yaml").write_text("name: my_app")
        # Força o motor a re-analisar a identidade para popular o 'detected'
        self.engine.project_identity = self.engine._discover_identity()
        
        # O teste foca na capacidade do motor em identificar a stack Flutter
        self.assertIn("Flutter", self.engine.project_identity["stacks"])

    def test_criticality_scoring(self):
        """Valida o cálculo de pontuação de criticidade sistêmica."""
        core_file = self.test_root / "src" / "core" / "essential.py"
        core_file.parent.mkdir(parents=True, exist_ok=True)
        core_file.write_text("class Essential: pass")
        
        # O score deve ser alto para arquivos no diretório 'core'
        score = self.engine.get_criticality_score(core_file)
        self.assertGreaterEqual(score, 10)

if __name__ == "__main__":
    unittest.main()
