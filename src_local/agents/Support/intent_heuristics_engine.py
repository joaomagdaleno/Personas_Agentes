"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Heurísticas de Intenção (IntentHeuristicsEngine)
Função: Especialista em detectar padrões de metadados e contextos de teste em AST.
"""
import ast

class IntentHeuristicsEngine:
    def is_metadata_context(self, node, tree, heuristics):
        """Encapsula verificações de contexto técnico/metadados."""
        if heuristics.is_meta_analysis_node(node): return True
        if heuristics.is_inside_rule_definition(node, tree): return True
        if self._is_analysis_comparison(node): return True
        return self._is_inside_test_method(node, tree, heuristics)

    def _is_analysis_comparison(self, node):
        from src_local.agents.Support.safety_definitions import TRIVIAL_COMPARE_KEYWORDS
        if isinstance(node, ast.Compare):
            for op in node.ops:
                if isinstance(op, ast.In) and isinstance(node.left, ast.Constant):
                    if any(kw in str(node.left.value) for kw in TRIVIAL_COMPARE_KEYWORDS):
                        return True
        return False

    def _is_inside_test_method(self, node, tree, heuristics):
        from src_local.agents.Support.test_discovery_logic import TestDiscoveryLogic
        return TestDiscoveryLogic().is_inside_test_method(node, tree, heuristics)
