"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Detector de Erros Silenciados (SilentErrorDetector)
Função: Especialista em identificar capturas de exceção sem tratamento via AST.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class SilentErrorDetector:
    def __init__(self, judge):
        self.judge = judge

    def detect(self, tree, rel_path, lines, agent_name, ignore_test_context=False):
        """Identifica padrões de falha lógica via análise AST."""
        issues = []
        for node in ast.walk(tree):
            if self._is_silent_except(node, tree, ignore_test_context):
                issues.append(self._create_issue(node, rel_path, lines, agent_name))
        return issues

    def _is_silent_except(self, node, tree, ignore_test_context):
        if not isinstance(node, ast.ExceptHandler): return False
        
        # Se for bare exce-pt ou exce-pt: pa-ss/continue
        is_empty = not node.type or (len(node.body) == 1 and isinstance(node.body[0], (ast.Pass, ast.Continue)))
        if is_empty:
            if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
                return False
            return True
        return False

    def _create_issue(self, node, rel_path, lines, agent_name):
        logger.warning(f"Silent error capture detected in {rel_path}:{node.lineno}")
        i = node.lineno - 1
        return {
            'file': rel_path, 'line': node.lineno, 
            'issue': 'Captura de erro silenciosa detectada.',
            'severity': 'high', 'context': agent_name,
            'snippet': "\n".join(lines[max(0, i-2):min(len(lines), i+3)])
        }