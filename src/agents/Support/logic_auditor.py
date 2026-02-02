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
