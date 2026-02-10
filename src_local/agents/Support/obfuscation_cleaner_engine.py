"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Limpeza de Ofuscação (ObfuscationCleanerEngine)
Função: Coletar e gerenciar substituições de strings ofuscadas.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class ObfuscationCleanerEngine:
    def collect_replacements(self, tree, hunter):
        collector = ReplacementCollector(hunter)
        collector.visit(tree)
        # Apply replacements in reverse order to keep offsets valid
        collector.replacements.sort(key=lambda x: x['start_offset'], reverse=True)
        return collector.replacements

    def get_offset(self, lines, lineno, col_offset):
        """Calcula o offset absoluto na string do arquivo."""
        if lineno > len(lines): return -1
        chars = sum(len(lines[i]) for i in range(lineno-1))
        return chars + col_offset

class ReplacementCollector(ast.NodeVisitor):
    def __init__(self, hunter):
        self.hunter = hunter
        self.replacements = []

    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.op, ast.Add):
            resolved = self.hunter._resolve_string_concat(node)
            if resolved:
                is_risky = any(kw in resolved for kw in self.hunter.DANGEROUS_KEYWORDS)
                if is_risky:
                    if hasattr(node, 'end_lineno') and hasattr(node, 'end_col_offset'):
                         self.replacements.append({
                             'node': node,
                             'new_text': resolved,
                             'start_offset': (node.lineno, node.col_offset)
                         })
