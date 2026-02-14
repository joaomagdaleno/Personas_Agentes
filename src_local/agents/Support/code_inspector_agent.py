import ast
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CodeInspectorAgent:
    """Agente especialista em inspeção profunda de intenção e lógica de código."""
    
    def __init__(self, cognitive_engine=None):
        self.brain = cognitive_engine

    def inspect_intent(self, content: str, filename: str) -> dict:
        """Audita se o código cumpre sua promessa técnica (Docstring)."""
        if not (content and self.brain): return None
        
        try:
            doc = ast.get_docstring(ast.parse(content))
            if not doc: return None
            
            from src_local.utils.cognitive_analyst import CognitiveAnalyst
            return CognitiveAnalyst.analyze_intent(filename, doc, content, self.brain)
        except Exception: return None

    def scan_file_logic(self, file_path, project_root, ignored_files, analyst):
        """Varredura lógica delegada via AST."""
        try:
            target = Path(file_path)
            rel = str(target.relative_to(project_root)).replace("", "/")
            if rel in ignored_files: return []
            
            content = target.read_text(encoding='utf-8', errors='ignore')
            if content:
                tree = ast.parse(content)
                return analyst.analyze_logic_flaws(tree, rel, content.splitlines(), "Inspector")
        except Exception as e:
            logger.error(f"❌ Falha na inspeção de {file_path}: {e}")
        return []
