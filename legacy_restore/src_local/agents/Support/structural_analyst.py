import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StructuralAnalyst:
    """🏗️ Analista Estrutural PhD: Analisa topologia e maturidade técnica."""
    
    def __init__(self):
        from src_local.agents.Support.maturity_evaluator import MaturityEvaluator
        from src_local.agents.Support.source_code_parser import SourceCodeParser
        from src_local.agents.Support.component_classifier import ComponentClassifier
        from src_local.agents.Support.logic_auditor import LogicAuditor
        from src_local.agents.Support.code_inspector_agent import CodeInspectorAgent
        
        self.maturity_evaluator = MaturityEvaluator()
        self.parser = SourceCodeParser()
        self.classifier = ComponentClassifier()
        self.logic_auditor = LogicAuditor()
        self.inspector = CodeInspectorAgent()

    def analyze_python(self, content: str, filename: str) -> dict:
        start_t = time.time()
        res = self._analyze_raw(content, filename)
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_t, f"⏱️ [StructuralAnalyst] Decomposição {filename}")
        return res

    def _analyze_raw(self, content, filename):
        if not filename.endswith('.py'): return {"complexity": 1, "dependencies": []}
        
        d = self.parser.analyze_py(content)
        if not d["tree"]: return {"complexity": 1, "dependencies": []}
        
        return {
            "complexity": self.parser.calculate_py_complexity(d["tree"]),
            "dependencies": self.parser.extract_py_imports(d["tree"]),
            "functions": d["functions"], "classes": d["classes"],
            "telemetry": any(kw in content for kw in ["telemetry", "log_performance"])
        }

    def map_component_type(self, rel_path): return self.classifier.map_type(rel_path)

    def analyze_logic_flaws(self, tree, rel_path, lines, name, ignore=False):
        return self.logic_auditor.scan_flaws(tree, rel_path, lines, name, ignore_test_context=ignore)

    def analyze_file_logic(self, path, root, ignored, name):
        return self.inspector.scan_file_logic(path, root, ignored, self)

    def calculate_maturity(self, content, stack):
        return self.maturity_evaluator.calculate_maturity(content, stack)

    def should_ignore(self, path):
        ignored = {'.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini'}
        return any(p in ignored for p in path.parts)

    def is_analyable(self, path):
        return path.is_file() and path.suffix in {'.py', '.dart', '.kt', '.yaml'}

    def read_project_file(self, path):
        try: return Path(path).read_text(encoding='utf-8', errors='ignore')
        except: return None

    def analyze_intent(self, content, filename, brain):
        self.inspector.brain = brain
        return self.inspector.inspect_intent(content, filename)
