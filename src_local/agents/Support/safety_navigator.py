import ast

class SafetyNavigator:
    """
    🛡️ Navegador de Segurança PhD.
    Especialista em identificar riscos de segurança e definições de regras na AST.
    """
    def __init__(self, utils):
        self.utils = utils

    def is_safe_context(self, node, tree):
        """Verifica se o nó está em um contexto explicitamente seguro (log ou regras)."""
        if self._is_inside_log_call(node, tree): return True
        if self._is_inside_rule_definition(node, tree): return True
        return False

    def is_being_executed(self, node, tree):
        """Verifica se o nó é um argumento de uma função de execução perigosa."""
        for n in ast.walk(tree):
            if not isinstance(n, ast.Call): continue
            
            if self._is_dangerous_call(n):
                for arg in n.args:
                    if self.utils.is_descendant(node, arg): return True
        return False

    def _is_dangerous_call(self, node):
        """Helper para identificar se uma chamada é inerentemente perigosa."""
        # 1. Chamada direta: eval(x)
        if isinstance(node.func, ast.Name):
            return node.func.id in ["eval", "exec", "system"]
        
        # 2. Chamada de atributo: os.system(x)
        if isinstance(node.func, ast.Attribute) and node.func.attr == "system":
            return isinstance(node.func.value, ast.Name) and node.func.value.id == "os"
            
        return False

    def _is_inside_log_call(self, target_node, tree):
        """Verifica se o nó está sendo passado para uma chamada de log."""
        safe_methods = ['info', 'warning', 'error', 'debug', 'exception']
        for node in ast.walk(tree):
            if self.utils.is_call_to(node, safe_methods):
                if any(self.utils.is_descendant(target_node, arg) for arg in node.args):
                    return True
        return False

    def _is_inside_rule_definition(self, target_node, tree):
        """Verifica se o nó faz parte de uma definição de regra ou padrão de auditoria."""
        safe_vars = [
            'rule', 'pattern', 'issue', 'regex', 'p_str', 'keyword', 'audit_rules', 
            'patterns', 'dangerous', 'veto_patterns', 'p_kw', 'e_kw', 
            'brittle_pattern', 'silent_pattern', 'target_pattern', 'fragilities',
            'part1', 'part2', 'part3', 'danger_kw', 'rules_def', 'reg_def',
            'keywords', 'tech_terms', 'financial_terms', 'forbidden'
        ]
        return any(self._matches_rule_def(n, target_node, safe_vars) for n in ast.walk(tree))

    def _matches_rule_def(self, node, target_node, safe_vars):
        """Helper para verificar se um nó corresponde a uma definição de regra segura."""
        if self._is_assignment_to(node, safe_vars):
             if self.utils.is_descendant(target_node, node.value): return True
        return self.utils.is_in_dict_value(node, target_node, safe_vars)

    def _is_assignment_to(self, node, names):
        """Helper para verificar se o nó é uma atribuição para um dos nomes listados."""
        if not isinstance(node, ast.Assign): return False
        
        def is_target_in_names(t):
            if isinstance(t, ast.Name): return t.id in names
            if isinstance(t, ast.Attribute): return t.attr in names
            return False

        return any(is_target_in_names(t) for t in node.targets)
