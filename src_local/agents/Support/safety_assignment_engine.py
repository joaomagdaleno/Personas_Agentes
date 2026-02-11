"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Atribuição de Segurança (SafetyAssignmentEngine)
Função: Validar se atribuições AST são para variáveis de metadados técnicos seguros.
"""
import ast
import logging
logger = logging.getLogger(__name__)

class SafetyAssignmentEngine:
    def is_in_metadata_assignment(self, parent_chain, target_node, utils, safe_vars):
        """Varre a cadeia de pais em busca de atribuições de metadados."""
        import time
        start_time = time.time()
        
        for parent in parent_chain:
            if isinstance(parent, ast.Assign) and self._is_assignment_to_safe(parent, safe_vars):
                from src_local.utils.logging_config import log_performance
                log_performance(logger, start_time, "Telemetry: Safety assignment check")
                return True
            if isinstance(parent, ast.Dict) and utils.is_in_dict_value(parent, target_node, safe_vars):
                return True
        return False

    def _is_assignment_to_safe(self, node, safe_vars):
        return any(self._is_safe_name(t, safe_vars) for t in node.targets)

    def _is_safe_name(self, node, safe_vars):
        if isinstance(node, ast.Name) and node.id in safe_vars: return True
        return isinstance(node, ast.Attribute) and node.attr in safe_vars
