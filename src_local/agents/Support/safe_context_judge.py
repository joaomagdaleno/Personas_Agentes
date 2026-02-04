import ast

class SafeContextJudge:
    """
    ⚖️ Juiz de Contexto Seguro (AST).
    Decide se um nó da AST está em um local seguro (teste, log, definição de regra),
    reduzindo a complexidade do auditor principal.
    """

    def __init__(self):
        from src_local.agents.Support.ast_navigator import ASTNavigator
        self.nav = ASTNavigator()

    def is_node_safe(self, node, tree):
        """Verifica se o nó está em um contexto seguro via Navigator."""
        return self.nav.check_safety_rules(node, tree)
