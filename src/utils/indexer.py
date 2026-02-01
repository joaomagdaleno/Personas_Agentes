import logging
import ast
from pathlib import Path

logger = logging.getLogger(__name__)

class Indexer:
    """PhD Metadata Indexer: Gerencia o conhecimento técnico do projeto."""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.index_file = self.project_root / "index.json"

    def update_index(self):
        """Varre o projeto para indexar metadados PhD."""
        logger.info("Iniciando indexação de metadados...")
        index_data = {"last_update": "", "files": {}}
        
        # Uso de Pathlib para modernização (Voyager)
        for path in self.project_root.rglob("*.py"):
            if "__pycache__" in str(path): continue
            
            rel_path = str(path.relative_to(self.project_root))
            index_data["files"][rel_path] = self._extract_metadata(path)
            
        return index_data

    def _extract_metadata(self, path: Path):
        """Extrai classes e funções via AST (Sem silenciamento Echo)."""
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            tree = ast.parse(content)
            return {
                "classes": [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)],
                "functions": [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            }
        except Exception as e:
            logger.debug(f"Falha AST em {path}: {e}")
            return {"error": "AST Failure"}
