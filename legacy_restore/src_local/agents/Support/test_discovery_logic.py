"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Lógica de Descoberta de Testes (TestDiscoveryLogic)
Função: Identificar contextos de teste em cadeias de pais AST.
"""
import ast
import logging
logger = logging.getLogger(__name__)

class TestDiscoveryLogic:
    def is_inside_test_method(self, node, tree, heuristics):
        import time
        start_time = time.time()
        
        parent_chain = heuristics.utils.get_parent_chain(node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.FunctionDef) and (parent.name.startswith('test_') or parent.name.endswith('_test')):
                return True
            if isinstance(parent, ast.ClassDef) and 'Test' in parent.name:
                from src_local.utils.logging_config import log_performance
                log_performance(logger, start_time, "Telemetry: Test discovery")
                return True
        return False
