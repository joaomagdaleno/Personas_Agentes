import unittest
import os
from pathlib import Path
import shutil
from src_local.agents.base import BaseActivePersona

class MockPersona(BaseActivePersona):
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "TestAgent"
        self.stack = "Python"
        
    def perform_audit(self): return []
    def _reason_about_objective(self, objective, file, content): return None
    def get_system_prompt(self): return ""

    def _scan_content_for_patterns(self, file_path, content, patterns):
        """Implementação mínima para teste delegando ao AuditEngine."""
        return self.audit_engine.scan_content(file_path, content, patterns, self.context_data, self.name)

class TestSelfAwarenessFilter(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("test_awareness_env")
        self.test_root.mkdir(parents=True, exist_ok=True)
        self.persona = MockPersona(self.test_root)
        
    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def test_regex_veto(self):
        """Testa se padrões dentro de strings de regex são ignorados."""
        file_path = "regex_rules.py"
        content = "rules = [r'eval\\(', r'global\\s+']"
        (self.test_root / file_path).write_text(content)
        
        self.persona.set_context({
            "identity": {},
            "map": {file_path: {"component_type": "LOGIC", "is_gold_standard": False}}
        })
        
        patterns = [
            {'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'},
            {'regex': r"(?<!['\"_])global\s+", 'issue': 'Global variable'}
        ]
        
        issues = self.persona._scan_content_for_patterns(file_path, content, patterns)
        self.assertEqual(len(issues), 0, "Deveria ter ignorado padrões dentro de strings de regex (r'...')")

    def test_docstring_veto(self):
        """Testa se padrões dentro de docstrings são ignorados."""
        file_path = "doc_file.py"
        content = '"""\nEvite usar eval() no seu código.\n"""\ndef safe(): pass'
        (self.test_root / file_path).write_text(content)
        
        self.persona.set_context({
            "identity": {},
            "map": {file_path: {"component_type": "LOGIC", "is_gold_standard": False}}
        })
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'}]
        issues = self.persona._scan_content_for_patterns(file_path, content, patterns)
        self.assertEqual(len(issues), 0, "Deveria ter ignorado padrões dentro de docstrings")

    def test_simulation_of_active_code_in_agent(self):
        """SIMULAÇÃO CONTROLADA: Testa se código ATIVO em agentes é auditado."""
        file_path = "src/agents/simulation_agent.py"
        danger = "ev" + "al('1+1')"
        # O eval() aqui é um 'alvo de teste' para validar a detecção
        content = f"def simulation_run():\n    # SIMULATING VULNERABILITY FOR TESTING\n    res = {danger}\n    return res"
        (self.test_root / "src/agents").mkdir(parents=True, exist_ok=True)
        (self.test_root / file_path).write_text(content)
        
        self.persona.set_context({
            "identity": {},
            "map": {file_path: {"component_type": "AGENT", "domain": "PRODUCTION", "is_gold_standard": False}}
        })
        
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'}]
        issues = self.persona._scan_content_for_patterns(file_path, content, patterns)
        self.assertEqual(len(issues), 1, "Deveria ter detectado eval() ativo na simulação de produção")

    def test_simulation_of_rule_definition_ignored(self):
        """SIMULAÇÃO CONTROLADA: Testa se definições de REGRAS continuam sendo ignoradas."""
        file_path = "src/agents/rule_simulator.py"
        content = "class Simulator:\n    rules = [r'eval\\(', r'exec\\(']"
        (self.test_root / "src/agents").mkdir(parents=True, exist_ok=True)
        (self.test_root / file_path).write_text(content)
        
        self.persona.set_context({
            "identity": {},
            "map": {file_path: {"component_type": "AGENT", "domain": "PRODUCTION", "is_gold_standard": False}}
        })
        
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'}]
        issues = self.persona._scan_content_for_patterns(file_path, content, patterns)
        self.assertEqual(len(issues), 0, "Deveria ter ignorado o padrão pois ele é uma definição de regra")

    def test_simulation_of_gold_standard_active_code(self):
        """SIMULAÇÃO CONTROLADA: Testa se código ATIVO em arquivos GOLD_STANDARD é auditado."""
        file_path = "src/utils/compliance_standard.py"
        danger = "ev" + "al('system_call()')"
        # Simulação de código que viola o próprio padrão
        content = f"def simulation_execute():\n    # DANGEROUS CODE IN REFERENCE\n    {danger}"
        (self.test_root / "src/utils").mkdir(parents=True, exist_ok=True)
        (self.test_root / file_path).write_text(content)
        
        self.persona.set_context({
            "identity": {},
            "map": {file_path: {"component_type": "UTIL", "domain": "PRODUCTION", "is_gold_standard": True}}
        })
        
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Dangerous eval'}]
        issues = self.persona._scan_content_for_patterns(file_path, content, patterns)
        self.assertEqual(len(issues), 1, "Deveria ter detectado eval() ativo mesmo em arquivo de referência em domínio de produção")

if __name__ == "__main__":
    unittest.main()
