"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Inspetor de Nós AST (ASTNodeInspector)
Função: Verificações atômicas sobre nós individuais da árvore sintática.
"""
import ast
import logging
logger = logging.getLogger(__name__)

class ASTNodeInspector:
    def is_descendant(self, target, parent):
        """Verifica se target é filho de parent na AST."""
        import time
        start_time = time.time()
        
        if target is parent: return True
        for child in ast.iter_child_nodes(parent):
            if self.is_descendant(target, child):
                from src_local.utils.logging_config import log_performance
                log_performance(logger, start_time, "Telemetry: is_descendant check")
                return True
        return False

    def is_call_to(self, node, names):
        """Verifica se o nó é uma chamada para uma das funções listadas."""
        if not isinstance(node, ast.Call): return False
        
        # Chamada direta: eval()
        if isinstance(node.func, ast.Name):
            return node.func.id in names
            
        # Chamada de atributo: logger.info()
        if isinstance(node.func, ast.Attribute):
            return node.func.attr in names
            
        return False
