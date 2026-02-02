import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class StructuralAnalyst:
    """Assistente Técnico: Especialista em Orquestração de Análise Estrutural 🏗️"""
    
    def __init__(self):
        from src.agents.Support.maturity_evaluator import MaturityEvaluator
        from src.agents.Support.source_code_parser import SourceCodeParser
        from src.agents.Support.component_classifier import ComponentClassifier
        from src.agents.Support.logic_auditor import LogicAuditor
        self.maturity_evaluator = MaturityEvaluator()
        self.parser = SourceCodeParser()
        self.classifier = ComponentClassifier()
        self.logic_auditor = LogicAuditor()

    def analyze_python(self, content: str, filename: str) -> dict:
        """Coordena a decomposição atômica via delegação."""
        if filename.endswith('.py'):
            d = self.parser.analyze_py(content)
            if d["tree"]:
                return {
                    "complexity": self.parser.calculate_py_complexity(d["tree"]),
                    "dependencies": self.parser.extract_py_imports(d["tree"]),
                    "functions": d["functions"], "classes": d["classes"]
                }
        if filename.endswith(('.kt', '.kts')):
            d = self.parser.analyze_kt(content)
            return {
                "complexity": self.parser.calculate_kt_complexity(content),
                "dependencies": d["imports"], "functions": d["functions"], "classes": d["classes"]
            }
        return {"complexity": 1, "dependencies": [], "functions": [], "classes": []}

    def map_component_type(self, rel_path: str):
        return self.classifier.map_type(rel_path)

    def analyze_logic_flaws(self, tree, rel_path, lines, agent_name):
        return self.logic_auditor.scan_flaws(tree, rel_path, lines, agent_name)

    def calculate_maturity(self, content: str, stack: str) -> dict:
        return self.maturity_evaluator.calculate_maturity(content, stack)

    def should_ignore(self, path: Path):
        ignored = {'.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules'}
        return any(part in ignored for part in path.parts)

    def is_analyable(self, path: Path):
        return path.is_file() and path.suffix in {'.py', '.dart', '.kt', '.yaml', '.xml'}

    def read_project_file(self, full_path: Path):
        try:
            return full_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.error(f"❌ Erro ao ler {full_path}: {e}")
            return None

