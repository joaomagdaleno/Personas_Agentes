"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Detector de Meta-Análise (MetaAnalysisDetector)
Função: Identificar padrões de meta-análise (ex: verificações de tipo AST, regex, introspecção).
"""
import ast
import logging

logger = logging.getLogger(__name__)


class MetaAnalysisDetector:
    """Assistente Técnico: Especialista em Detecção de Meta-Análise 🔬"""
    
    def __init__(self):
        from src_local.agents.Support.safety_definitions import META_ANALYSIS_LIBS
        self.meta_libs = META_ANALYSIS_LIBS
    
    def is_meta_analysis_node(self, node):
        """🚀 Detecta se o nó é uma lógica de meta-análise (ex: isinstance(node, ast.Global))."""
        if not isinstance(node, ast.Call): return False
        
        if self._is_isinstance_ast_check(node):
            logger.debug(f"Detector de Meta-Análise: Detectado check de AST (isinstance) na linha {getattr(node, 'lineno', 'unknown')}")
            return True
        if self._is_regex_call(node):
            logger.debug(f"Detector de Meta-Análise: Detectado uso de regex na linha {getattr(node, 'lineno', 'unknown')}")
            return True
        
        return False

    def _is_isinstance_ast_check(self, node):
        """Detecta isinstance(..., ast.XYZ)."""
        if not (isinstance(node.func, ast.Name) and node.func.id == 'isinstance'):
            return False
        if len(node.args) < 2: return False
        
        arg2 = node.args[1]
        if isinstance(arg2, ast.Attribute) and isinstance(arg2.value, ast.Name) and arg2.value.id in self.meta_libs:
            return True
        if isinstance(arg2, ast.Name) and arg2.id in ['BinOp', 'Call', 'Global', 'Expr', 'Assign', 'FunctionDef', 'ClassDef']:
            return True
        return False

    def _is_regex_call(self, node):
        """Detecta re.search/match/findall."""
        if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == 're':
            return True
        return False
