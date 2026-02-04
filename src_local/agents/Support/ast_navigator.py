import ast

class ASTNavigator:
    """
    🧭 Navegador de AST.
    Encapsula a lógica de travessia e verificação de nós para aliviar o SafeContextJudge.
    """
    
    def is_descendant(self, target, parent):
        """Verifica se target é filho de parent na AST."""
        for child in ast.walk(parent):
            if child is target:
                return True
        return False

    def is_call_to(self, node, names):
        """Verifica se o nó é uma chamada para uma das funções listadas."""
        if not isinstance(node, ast.Call): return False
        
        # Chamada direta: eval()
        if isinstance(node.func, ast.Name):
            return hasattr(node.func, 'id') and node.func.id in names
            
        # Chamada de atributo: logger.info()
        if isinstance(node.func, ast.Attribute):
            return hasattr(node.func, 'attr') and node.func.attr in names
            
        return False

    def is_assignment_to(self, node, target_substrings):
        """Verifica se o nó é uma atribuição para uma variável contendo substrings alvo."""
        if not isinstance(node, ast.Assign): return False
        
        for target in node.targets:
            if isinstance(target, ast.Name):
                if any(x in target.id for x in target_substrings): return True
        return False

    def check_safety_rules(self, node, tree):
        """Aggregate check for all safety rules."""
        if self._is_inside_assertion(node, tree): return True
        if self._is_inside_log_call(node, tree): return True
        if self._is_inside_rule_definition(node, tree): return True
        return not self._is_being_executed(node, tree)

    def _is_inside_log_call(self, target_node, tree):
        safe_methods = ['info', 'warning', 'error', 'debug', 'exception']
        for node in ast.walk(tree):
            if self.is_call_to(node, safe_methods):
                 for arg in node.args:
                    if self.is_descendant(target_node, arg): return True
        return False

    def _is_inside_rule_definition(self, target_node, tree):
        for node in ast.walk(tree):
            if self.is_assignment_to(node, ['rule', 'pattern', 'issue', 'regex']):
                 if self.is_descendant(target_node, node.value): return True
            if self.is_in_dict_value(node, target_node, ['regex', 'issue', 'pattern']): return True
        return False

    def _is_inside_assertion(self, target_node, tree):
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if hasattr(node.func, 'attr') and node.func.attr.startswith("assert"):
                    for arg in node.args:
                        if self.is_descendant(target_node, arg): return True
        return False

    def _is_being_executed(self, target_node, tree):
        dangerous = ["eval", "exec", "os.system"]
        for node in ast.walk(tree):
            if self.is_call_to(node, dangerous):
                for arg in node.args:
                    if self.is_descendant(target_node, arg): return True
        return False
