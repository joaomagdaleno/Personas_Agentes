
    def __init__(self):
        from src_local.agents.Support.ast_navigator import ASTNavigator
        self.nav = ASTNavigator()

    def is_node_safe(self, node, tree):
        """Verifica se o nó está em um contexto seguro (Definição de Regra, Log, Teste)."""
        if self._is_inside_assertion(node, tree): return True
        if self._is_inside_log_call(node, tree): return True
        if self._is_inside_rule_definition(node, tree): return True
        if not self._is_being_executed(node, tree): return True
        return False

    def _is_inside_log_call(self, target_node, tree):
        """Safe: Argumento de logger.info/warning/error."""
        safe_methods = ['info', 'warning', 'error', 'debug', 'exception']
        for node in ast.walk(tree):
            if self.nav.is_call_to(node, safe_methods):
                 for arg in node.args:
                    if self.nav.is_descendant(target_node, arg):
                        return True
        return False

    def _is_inside_rule_definition(self, target_node, tree):
        """Safe: Valor em dicionário/lista de regras (audit_rules, patterns)."""
        for node in ast.walk(tree):
            # 1. Atribuição a variável de regra
            if self.nav.is_assignment_to(node, ['rule', 'pattern', 'issue', 'regex']):
                 if self.nav.is_descendant(target_node, node.value): return True
            
            # 2. Dicionário (chave 'regex' ou 'issue')
            if isinstance(node, ast.Dict):
                for k, v in zip(node.keys, node.values):
                     if self.nav.is_descendant(target_node, v):
                         if isinstance(k, (ast.Constant, ast.Str)): 
                             key_val = getattr(k, "value", getattr(k, "s", ""))
                             if key_val in ['regex', 'issue', 'pattern']: return True
        return False

    def _is_inside_assertion(self, target_node, tree):
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if hasattr(node.func, 'attr') and node.func.attr.startswith("assert"):
                    for arg in node.args:
                        if self.nav.is_descendant(target_node, arg):
                            return True
        return False

    def _is_being_executed(self, target_node, tree):
        dangerous = ["eval", "exec", "os.system"]
        for node in ast.walk(tree):
            if self.nav.is_call_to(node, dangerous):
                for arg in node.args:
                    if self.nav.is_descendant(target_node, arg):
                        return True
        return False
