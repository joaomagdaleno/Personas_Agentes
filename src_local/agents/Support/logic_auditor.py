"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Lógica (LogicAuditor)
Função: Detectar anti-padrões lógicos via AST.
"""
import ast

class LogicAuditor:
    """Assistente Técnico: Especialista em Integridade Lógica 🧠"""

    def scan_flaws(self, tree, rel_path, lines, agent_name):
        """Identifica padrões de falha lógica via AST."""
        issues = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler):
                if not node.type or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                    i = node.lineno - 1
                    issues.append({
                        'file': rel_path, 'line': node.lineno, 
                        'issue': 'Captura de erro silenciosa detectada.',
                        'severity': 'high', 'context': agent_name,
                        'snippet': "\n".join(lines[max(0, i-2):min(len(lines), i+3)])
                    })
        return issues

    def is_interaction_safe(self, content: str, line_number: int, risk_type: str) -> bool:
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if hasattr(node, 'lineno') and node.lineno == line_number:
                    
                    # Compatibilidade Python 3.14 (ast.Str removido) vs antigo
                    str_types = (ast.Constant,)
                    if hasattr(ast, "Str"):
                        str_types += (getattr(ast, "Str"),)

                    if isinstance(node, str_types):
                        val = getattr(node, "value", getattr(node, "s", ""))
                        if isinstance(val, str) and risk_type in val:
                            if self._is_safe_context(node, tree):
                                return True
            return False
        except Exception:
            return False

    def _is_safe_context(self, node, tree):
        """Verifica se o nó está em um contexto seguro (Definição de Regra, Log, Teste)."""
        if self._is_inside_assertion(node, tree): return True
        if self._is_inside_log_call(node, tree): return True
        if self._is_inside_rule_definition(node, tree): return True
        if not self._is_being_executed(node, tree): return True
        return False

    def _is_inside_log_call(self, target_node, tree):
        """Safe: Argumento de logger.info/warning/error."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                func = node.func
                # Detecta logger.method(...) ou logging.method(...)
                if isinstance(func, ast.Attribute) and (hasattr(func, 'attr') and func.attr in ['info', 'warning', 'error', 'debug', 'exception']):
                     for arg in node.args:
                        if self._is_descendant(target_node, arg):
                            return True
        return False

    def _is_inside_rule_definition(self, target_node, tree):
        """Safe: Valor em dicionário/lista de regras (audit_rules, patterns)."""
        for node in ast.walk(tree):
            # 1. Atribuição a variável de regra (rules = [...])
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and any(x in target.id for x in ['rule', 'pattern', 'issue', 'regex']):
                         if self._is_descendant(target_node, node.value): return True
            
            # 2. Dicionário (chave 'regex' ou 'issue')
            if isinstance(node, ast.Dict):
                # Se o target é um VALOR e a CHAVE correspondente é 'regex'
                for k, v in zip(node.keys, node.values):
                     if self._is_descendant(target_node, v):
                         # Verifica a chave
                         if isinstance(k, (ast.Str, ast.Constant)):
                             key_val = getattr(k, "value", getattr(k, "s", ""))
                             if key_val in ['regex', 'issue', 'pattern']: return True
        return False

    def _is_inside_assertion(self, target_node, tree):
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if hasattr(node.func, 'attr') and node.func.attr.startswith("assert"):
                    for arg in node.args:
                        if self._is_descendant(target_node, arg):
                            return True
        return False

    def _is_being_executed(self, target_node, tree):
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if hasattr(node.func, 'id') and node.func.id in ["eval", "exec", "os.system"]:
                    for arg in node.args:
                        if self._is_descendant(target_node, arg):
                            return True
        return False

    def _is_descendant(self, target, parent):
        """Verifica se target é filho de parent na AST."""
        for child in ast.walk(parent):
            if child is target:
                return True
        return False
