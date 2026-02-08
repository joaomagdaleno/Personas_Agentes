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
        dangerous = ["eval", "exec", "os.system", "system"]
        for n in ast.walk(tree):
            if self.utils.is_call_to(n, dangerous):
                # Se for atributo, verifica se é 'os.system'
                if isinstance(n.func, ast.Attribute):
                    # Se for 'os.system', id de value é 'os' e attr é 'system'
                    # Se for 'Path.unlink', id de value é 'Path' e attr é 'unlink'
                    val = n.func.value
                    if isinstance(val, ast.Name) and val.id != 'os':
                        continue # Não é os.system (ex: Path.unlink)

                for arg in n.args:
                    if self.utils.is_descendant(node, arg): return True
        return False

    def _is_inside_log_call(self, target_node, tree):
        """Verifica se o nó está sendo passado para uma chamada de log."""
        safe_methods = ['info', 'warning', 'error', 'debug', 'exception']
        for node in ast.walk(tree):
            if self.utils.is_call_to(node, safe_methods):
                 for arg in node.args:
                    if self.utils.is_descendant(target_node, arg): return True
        return False

    def _is_inside_rule_definition(self, target_node, tree):
        """Verifica se o nó faz parte de uma definição de regra ou padrão de auditoria."""
        safe_vars = ['rule', 'pattern', 'issue', 'regex', 'p_str', 'keyword', 'audit_rules', 'patterns', 'dangerous', 'veto_patterns']
        for node in ast.walk(tree):
            if self._is_assignment_to(node, safe_vars):
                 if self.utils.is_descendant(target_node, node.value): return True
            if self.utils.is_in_dict_value(node, target_node, safe_vars): return True
        return False

    def _is_assignment_to(self, node, names):
        """Helper para verificar se o nó é uma atribuição para um dos nomes listados."""
        if not isinstance(node, ast.Assign): return False
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in names: return True
        return False
