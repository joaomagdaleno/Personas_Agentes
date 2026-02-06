import unittest
from pathlib import Path
import shutil
from src_local.utils.context_engine import ContextEngine
from src_local.agents.base import BaseActivePersona

class MockPhD(BaseActivePersona):
    def perform_audit(self): return []
    def _reason_about_objective(self, obj, file, content): return f"Analysed {file}"
    def get_system_prompt(self): return ""

class TestCoreDepth(unittest.TestCase):
    """
    Cura de Validação: Testes de Profundidade para o Core do Sistema 🟢
    """
    
    def setUp(self):
        self.test_root = Path("temp_core_depth")
        self.test_root.mkdir(exist_ok=True)
        
        # Injeção Manual para estabilidade de teste
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.engine = ContextEngine(self.test_root, support_tools=support)
        self.persona = MockPhD(project_root=self.test_root)
        self.persona.set_context({"map": {}})

    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def test_context_engine_deep_analysis(self):
        """Valida se o motor identifica corretamente múltiplos aspectos de um arquivo."""
        file = self.test_root / "logic.py"
        # Usamos eval direto aqui para garantir que o motor REALMENTE detecta
        file.write_text("import os\ndef complex():\n    if True: pass\n    try: eval('1')\n    except: pass")
        
        self.engine._register_file(file)
        rel_path = file.relative_to(self.test_root).as_posix()
        info = self.engine.map[rel_path]
        
        # Múltiplas asserções para garantir nível DEEP
        self.assertEqual(info["component_type"], "LOGIC")
        self.assertTrue(info["brittle"], "Deveria detectar eval()")
        self.assertTrue(info["silent_error"], "Deveria detectar except pass")
        self.assertGreater(info["complexity"], 1, "Deveria calcular complexidade real")
        self.assertIn("complex", info["functions"])
        self.assertIn("os", info["dependencies"])

    def test_base_persona_targeted_audit(self):
        """Valida a precisão da auditoria cirúrgica da Base Persona."""
        self.persona.set_context({
            "identity": {"core_mission": "Test"},
            "map": {"target.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        # Teste 1: Auditoria Direta
        res = self.persona.perform_strategic_audit(file_target="target.py", content_target="some content")
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0], "Analysed target.py")
        
        # Teste 2: Ignorar arquivos proibidos
        self.persona.ignored_files.append("secret.txt")
        res_hidden = self.persona.perform_strategic_audit(file_target="secret.txt", content_target="content")
        self.assertEqual(len(res_hidden), 1, "A auditoria direta ignora a lista de ignorados por design cirúrgico")

    def test_audit_engine_precision(self):
        """Valida se o AuditEngine diferencia regras de código ativo."""
        danger = "eval('1+1')"
        rules_def = "r'eval\\('"
        content = f"rules = [{rules_def}]\nres = {danger}"
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'}]
        
        # Simula contexto de AGENT (onde regras são comuns)
        ctx = {"target.py": {"component_type": "AGENT", "domain": "PRODUCTION"}}
        
        issues = self.persona.audit_engine.scan_content("target.py", content, patterns, ctx, "TestAgent")
        
        # Deve encontrar apenas 1 issue (a chamada real), ignorando a definição na lista
        self.assertEqual(len(issues), 1, "Deveria ignorar a definição da regra e pegar apenas o código ativo")
        self.assertEqual(issues[0]["line"], 2)

if __name__ == "__main__":
    unittest.main()
