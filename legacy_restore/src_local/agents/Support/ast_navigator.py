import ast
import logging
logger = logging.getLogger(__name__)

class ASTNavigator:
    """
    🧭 Navegador de AST.
    Atua como coordenador de travessia, delegando inteligência para 
    navegadores especializados (TestNavigator, SafetyNavigator).
    """
    
    def __init__(self):
        from src_local.agents.Support.test_navigator import TestNavigator
        from src_local.agents.Support.safety_navigator import SafetyNavigator
        from src_local.agents.Support.ast_traversal_logic import ASTTraversalLogic
        self.test_nav = TestNavigator(self)
        self.safety_nav = SafetyNavigator(self)
        self.traversal = ASTTraversalLogic()

    def check_safety_rules(self, node, tree):
        """Coordenador: Executa verificação em cascata via delegados."""
        import time
        start_time = time.time()
        
        if self.test_nav.is_inside_test_context(node, tree): return True
        if self.safety_nav.is_safe_context(node, tree): return True
        result = not self.safety_nav.is_being_executed(node, tree)
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: content safety check")
        return result

    # --- Utilitários Compartilhados (Delegados) ---

    def is_descendant(self, target, parent):
        return self.traversal.is_descendant(target, parent)

    def is_call_to(self, node, names):
        return self.traversal.is_call_to(node, names)

    def is_in_dict_value(self, node, target_node, key_names):
        """Verifica se target_node é valor em um dicionário via traversal logic."""
        return self.traversal.is_in_dict_value(node, target_node, key_names, self)

    def get_parent_chain(self, target_node, tree):
        """Reconstrói a linhagem delegando para traversal logic."""
        return self.traversal.get_parent_chain(target_node, tree)
