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

    def is_node_safe(self, node, tree, ignore_test_context=False):
        """
        🛡️ Verifica se o nó está em um contexto seguro.
        Diferencia execução real de strings em definições de regras.
        """
        # 1. Se estiver dentro de um Log ou Definição de Regra técnica -> SEGURO
        if self.nav.safety_nav.is_safe_context(node, tree):
            return True

        # 2. Se for uma falha estrutural (ExceptHandler) ou Chamada em teste -> SEGURO
        if not ignore_test_context and self.nav.test_nav.is_inside_test_context(node, tree):
            return True

        return False