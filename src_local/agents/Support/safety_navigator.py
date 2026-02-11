import ast
import logging
logger = logging.getLogger(__name__)

class SafetyNavigator:
    """
    🛡️ Navegador de Segurança PhD.
    Especialista em identificar riscos de segurança e definições de regras na AST.
    """
    def __init__(self, utils):
        self.utils = utils
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        self.heuristics = SafetyHeuristics(utils)

    def is_safe_context(self, node, tree):
        """Verifica se o nó está em um contexto explicitamente seguro (log ou regras)."""
        import time
        start_time = time.time()
        
        res = self.heuristics.is_inside_log_call(node, tree) or \
               self.heuristics.is_inside_rule_definition(node, tree)
               
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: Safe context check")
        return res

    def is_being_executed(self, node, tree):
        """Verifica se o nó é um argumento de uma função de execução perigosa."""
        for n in ast.walk(tree):
            if self.heuristics.is_dangerous_call(n):
                if any(self.utils.is_descendant(node, arg) for arg in n.args):
                    return True
        return False