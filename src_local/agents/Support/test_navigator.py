import ast

class TestNavigator:
    """
    🧪 Navegador de Testes PhD.
    Especialista em identificar se um nó da AST pertence a um contexto de teste.
    """
    def __init__(self, utils):
        self.utils = utils

    def is_inside_test_context(self, node, tree):
        """Verifica se o nó está em qualquer contexto relacionado a testes."""
        return self._is_inside_assertion(node, tree) or self._is_inside_test_method(node, tree)

    def _is_inside_test_method(self, target_node, tree):
        """Verifica se o nó está dentro de um método de teste (test_, setUp, tearDown)."""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                if node.name.startswith("test_") or node.name in ["setUp", "tearDown"]:
                    if self.utils.is_descendant(target_node, node): return True
        return False

    def _is_inside_assertion(self, target_node, tree):
        """Verifica se o nó está dentro de uma chamada de asserção (unittest/pytest)."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if node.func.attr.startswith("assert"):
                    for arg in node.args:
                        if self.utils.is_descendant(target_node, arg): return True
        return False
