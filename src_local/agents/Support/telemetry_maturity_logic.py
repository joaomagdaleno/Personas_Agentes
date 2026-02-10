"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Lógica de Maturidade de Telemetria (TelemetryMaturityLogic)
Função: Avaliar padrões de tempo/performance e nomes de telemetria.
"""
import ast
from src_local.agents.Support.safety_definitions import TELEMETRY_KEYWORDS

class TelemetryMaturityLogic:
    def is_simple_time_subtraction(self, node):
        """Verifica se o nó é uma subtração simples de time.time()."""
        val = node.value if isinstance(node, ast.Assign) else node
        if not (isinstance(val, ast.BinOp) and isinstance(val.op, ast.Sub)): return False
            
        left = val.left
        if isinstance(left, ast.Call):
            func = left.func
            return (isinstance(func, ast.Attribute) and func.attr == 'time') or \
                   (isinstance(func, ast.Name) and func.id == 'time')
        return False

    def is_tele_name(self, node):
        """Analisa se o nome indica telemetria."""
        name = node.id if isinstance(node, ast.Name) else (node.attr if isinstance(node, ast.Attribute) else "")
        return any(k in name.lower() for k in TELEMETRY_KEYWORDS)

    def is_assigned_to_log_variable(self, target_node, tree, heuristics):
        """Detecta se o resultado da subtração de tempo vai para variável de telemetria."""
        parent_chain = heuristics.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.Assign):
                return any(self.is_tele_name(t) for t in parent.targets)
        return False
