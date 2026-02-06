"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Lógica (LogicAuditor)
Função: Detectar anti-padrões lógicos via AST.
"""
import ast

class LogicAuditor:
    """Assistente Técnico: Especialista em Integridade Lógica 🧠"""

    def __init__(self):
        from src_local.agents.Support.safe_context_judge import SafeContextJudge
        self.judge = SafeContextJudge()

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

    def is_interaction_safe(self, content: str, line_number: int, risk_type: str) -> tuple:
        """⚖️ Validação profunda: Retorna (is_safe, reason) para transparência total."""
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
                        if isinstance(val, str) and risk_type.lower() in val.lower():
                            if self.judge.is_node_safe(node, tree):
                                return True, "Padrão identificado em contexto técnico seguro (Regra de Auditoria ou Teste)."
                            return False, "Padrão de risco em contexto de execução potencial."
            return False, "Não foi possível validar o contexto do nó na AST."
        except Exception as e:
            return False, f"Falha na análise AST: {e}"
