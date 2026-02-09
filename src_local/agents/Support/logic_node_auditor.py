"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Nós Lógicos (LogicNodeAuditor)
Função: Especialista em validar nós AST individuais para detecção de riscos.
"""
import ast
import logging
from src_local.agents.Support.safety_definitions import TELEMETRY_KEYWORDS

logger = logging.getLogger(__name__)

class LogicNodeAuditor:
    def __init__(self, heuristics, judge, call_judge):
        self.heuristics = heuristics
        self.judge = judge
        self.call_judge = call_judge

    def audit(self, node, tree, content, line_no, risk_type, ignore_test):
        """Valida um nó individual em contexto de lógica real."""
        if not isinstance(node, (ast.Call, ast.BinOp, ast.Global, ast.Expr, ast.Assign)):
            return None, None

        # 1. Telemetria em Lógica
        node_dump = ast.dump(node)
        if "time" in node_dump and ("Sub" in node_dump or "BinOp" in node_dump):
            from src_local.agents.Support.telemetry_intent_judge import TelemetryIntentJudge
            is_safe, _, reason = TelemetryIntentJudge(self.heuristics, self.judge).judge_intent(node, tree, ignore_test)
            if reason:
                logger.debug(f"Audit: Analizado item de telemetria na linha {node.lineno if hasattr(node, 'lineno') else '?'}. Safe: {is_safe}. Reason: {reason}")
                return is_safe, (reason + " [Severity: STRATEGIC]" if not is_safe else reason)

        # 2. Global em Lógica
        if risk_type == "brittle" and isinstance(node, ast.Global):
             return False, "Uso de estado global detectado. [Severity: HIGH]"

        # 3. Chamadas Perigosas
        if isinstance(node, ast.Call):
            return self.call_judge.validate(node, tree, ignore_test)
            
        return None, None
