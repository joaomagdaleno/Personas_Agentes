import ast
import logging
from src_local.agents.Support.safety_definitions import TELEMETRY_KEYWORDS, CRITICAL_LOG_METHODS

logger = logging.getLogger(__name__)

class TelemetryIntentJudge:
    def __init__(self, heuristics, judge):
        self.heuristics = heuristics
        self.judge = judge

    def judge_intent(self, node, tree, ignore_test_context=False):
        """⚖️ Analisa a intencionalidade do uso de tempo/performance."""
        # 1. Definições e Observabilidade
        res, severity, reason = self._check_definition_and_obs(node, tree)
        if res is not None: return res, severity, reason

        # 2. Lógica de Controle e Padronização
        return self._check_logic_and_standard(node, tree)

    def _check_definition_and_obs(self, node, tree):
        """Valida se o uso é meramente técnico ou para log informacional."""
        if self.heuristics.is_inside_rule_definition(node, tree):
            return True, "STRATEGIC", "Definição técnica de padrão de telemetria."
            
        if self._is_inside_critical_report(node, tree):
            return False, "HIGH", "Telemetria manual em fluxo de erro crítico. Use _log_performance para integridade."

        if self.heuristics.is_inside_log_call(node, tree):
            return False, "STRATEGIC", "Telemetria manual em Log (Info/Debug). Sugestão: Migrar para _log_performance."
            
        return None, None, None

    def _check_logic_and_standard(self, node, tree):
        """Valida se o uso em lógica é passível de padronização estratégica."""
        if self._is_assigned_to_log_variable(node, tree):
            return False, "STRATEGIC", "Cálculo de duração manual para Log futuro. Sugestão: Usar utilitários da Base."

        if self._is_simple_time_subtraction(node):
            return False, "STRATEGIC", "Telemetria manual detectada. Sugestão: Migrar para _log_performance."

        return False, "MEDIUM", "Telemetria manual detectada em Lógica de Controle (Risco de Runtime)."

    def _is_simple_time_subtraction(self, node):
        """Verifica se o nó é uma subtração simples de time.time()."""
        val = node.value if isinstance(node, ast.Assign) else node
        if not (isinstance(val, ast.BinOp) and isinstance(val.op, ast.Sub)): return False
            
        left = val.left
        if isinstance(left, ast.Call):
            func = left.func
            return (isinstance(func, ast.Attribute) and func.attr == 'time') or \
                   (isinstance(func, ast.Name) and func.id == 'time')
        return False

    def _is_inside_critical_report(self, target_node, tree):
        """Detecta se o nó está dentro de um logger.error ou similar."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        return any(isinstance(p, ast.Call) and self.heuristics.utils.is_call_to(p, CRITICAL_LOG_METHODS) for p in parent_chain)

    def _is_assigned_to_log_variable(self, target_node, tree):
        """Detecta se o resultado da subtração de tempo vai para uma variável de telemetria."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.Assign):
                return any(self._is_tele_name(t) for t in parent.targets)
        return False

    def _is_tele_name(self, node):
        """Analisa se o nome indica telemetria."""
        name = node.id if isinstance(node, ast.Name) else (node.attr if isinstance(node, ast.Attribute) else "")
        return any(k in name.lower() for k in TELEMETRY_KEYWORDS)

