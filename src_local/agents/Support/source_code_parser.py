"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Analisador de Código Fonte (SourceCodeParser)
Função: Especialista em decompor sintaxe Python, Kotlin e Dart.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class SourceCodeParser:
    """
    🔍 Analisador de Código Fonte PhD.
    O motor de parsing multi-stack do Orquestrador, capaz de decompor sintaxe
    Python (via AST) e Kotlin/Dart (via heurísticas) em metadados estruturais.
    """

    def analyze_py(self, content: str):
        """Parsing profundo de Python via AST."""
        try:
            tree = ast.parse(content)
            return {
                "functions": [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)],
                "classes": [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)],
                "tree": tree
            }
        except Exception:
            return {"functions": [], "classes": [], "tree": None}

    def analyze_kt(self, content: str):
        """
        🎼 Parsing heurístico de Kotlin.
        Identifica imports, classes e funções usando padrões de texto soberanos.
        """
        lines = content.splitlines()
        return {
            "imports": [l.split()[1] for l in lines if l.startswith('import ')],
            "functions": [l.split('fun ')[1].split('(')[0] for l in lines if 'fun ' in l],
            "classes": [l.split('class ')[1].split('(')[0].split('{')[0].strip() for l in lines if 'class ' in l]
        }

    def calculate_py_complexity(self, tree) -> int:
        """
        📐 Cálculo de complexidade ciclomática via árvore AST.
        Mapeia a densidade de ramificações lógicas (if, for, while, except).
        """
        import time
        start_comp = time.time()
        count = 1
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler, ast.With)):
                count += 1
            elif isinstance(node, ast.BoolOp):
                count += len(node.values) - 1
        
        duration = time.time() - start_comp
        if duration > 0.05:
            logger.debug(f"⏱️ [SourceParser] Complexidade lenta: {duration:.4f}s")
            
        return count

    def extract_py_imports(self, tree) -> list:
        """
        🔗 Extração de dependências soberanas via AST.
        Mapeia todos os módulos importados para análise de acoplamento.
        """
        import time
        start_imp = time.time()
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imports.extend(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module:
                imports.append(node.module)
        
        duration = time.time() - start_imp
        if duration > 0.05:
            logger.debug(f"⏱️ [SourceParser] Extração lenta: {duration:.4f}s")
            
        return list(set(imports))

    def calculate_kt_complexity(self, content: str) -> int:
        """
        📐 Heurística de complexidade para Kotlin.
        Quantifica ramificações baseadas em palavras-chave e chamadas de escopo Compose.
        """
        keywords = ['if ', 'for ', 'while ', 'when ', 'catch ', '?.let', '?.also', '?.run']
        return sum(content.count(kw) for kw in keywords) + 1
