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
            
        return self._check_observability_context(node, tree)

    def _check_observability_context(self, node, tree):
        """Diferencia reportes críticos de logs informacionais."""
        if self._is_inside_critical_report(node, tree):
            return False, "HIGH", "Telemetria manual em fluxo de erro crítico. Use _log_performance para integridade."

        if self.heuristics.is_inside_log_call(node, tree):
            return False, "STRATEGIC", "Telemetria manual em Log (Info/Debug). Sugestão: Migrar para _log_performance."
            
        return None, None, None

    def _check_logic_and_standard(self, node, tree):
        """Valida se o uso em lógica delegando para maturity logic."""
        from src_local.agents.Support.telemetry_maturity_logic import TelemetryMaturityLogic
        self.maturity = TelemetryMaturityLogic()
        
        if self.maturity.is_assigned_to_log_variable(node, tree, self.heuristics):
            return False, "STRATEGIC", "Cálculo de duração manual para Log futuro. Sugestão: Usar utilitários da Base."

        if self.maturity.is_simple_time_subtraction(node):
            return False, "STRATEGIC", "Telemetria manual detectada. Sugestão: Migrar para _log_performance."

        return False, "MEDIUM", "Telemetria manual detectada em Lógica de Controle (Risco de Runtime)."

    def _is_inside_critical_report(self, target_node, tree):
        """Detecta se o nó está dentro de um logger.error ou similar."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        return any(isinstance(p, ast.Call) and self.heuristics.utils.is_call_to(p, CRITICAL_LOG_METHODS) for p in parent_chain)

