import ast
import os
import json

class ContextEngine:
    """
    O Cérebro Semântico: Analisa o código para entender a intenção, 
    não apenas o texto.
    """
    def __init__(self, project_root):
        self.project_root = project_root
        self.map = {}

    def analyze_project(self):
        """Varre o projeto e cria um mapa de 'Porquês' e 'Comos'."""
        for root, _, files in os.walk(self.project_root):
            for f in files:
                if f.endswith('.py'):
                    path = os.path.join(root, f)
                    self.map[os.path.relpath(path, self.project_root)] = self._analyze_file(path)
        return self.map

    def _analyze_file(self, path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            
            info = {
                "purpose": ast.get_docstring(tree) or "Sem documentação de propósito.",
                "functions": [],
                "classes": [],
                "complexity_score": 0
            }

            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    info["functions"].append({
                        "name": node.name,
                        "args": [arg.arg for arg in node.args.args],
                        "doc": ast.get_docstring(node)
                    })
                elif isinstance(node, ast.ClassDef):
                    info["classes"].append(node.name)
                elif isinstance(node, (ast.For, ast.While, ast.If)):
                    info["complexity_score"] += 1

            return info
        except Exception as e:
            return {"error": str(e)}

    def get_file_context(self, rel_path):
        return self.map.get(rel_path, {"purpose": "Contexto desconhecido"})
