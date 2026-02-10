"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Heurísticas de Segurança (SafetyHeuristics)
Função: Centralizar lógica de detecção de contextos seguros e perigosos via Análise Semântica de Intencionalidade.
"""
import ast
import logging
from src_local.agents.Support.safety_definitions import SAFE_METADATA_VARS, SAFE_LOG_METHODS, CORE_PERFORMANCE_FUNCS

logger = logging.getLogger(__name__)

class SafetyHeuristics:
    def __init__(self, utils):
        from src_local.agents.Support.safety_assignment_engine import SafetyAssignmentEngine
        self.utils = utils
        self.safe_metadata_vars = SAFE_METADATA_VARS
        self.assignment_engine = SafetyAssignmentEngine()

    def is_dangerous_call(self, node):
        """🛡️ Detecta chamadas a funções de execução dinâmica."""
        if not isinstance(node, ast.Call): return False
        if isinstance(node.func, ast.Name):
            return node.func.id in ["eval", "exec", "system"]
        if isinstance(node.func, ast.Attribute) and node.func.attr == "system":
            return isinstance(node.func.value, ast.Name) and node.func.value.id == "os"
        return False

    def is_inside_log_call(self, target_node, tree):
        """⚖️ Valida se o nó está protegido por telemetria."""
        for node in ast.walk(tree):
            if self.utils.is_call_to(node, SAFE_LOG_METHODS):
                if any(self.utils.is_descendant(target_node, arg) for arg in node.args):
                    return True
        return False

    def is_inside_rule_definition(self, target_node, tree):
        """🧠 Análise Semântica: Verifica se o nó faz parte de uma estrutura de metadados técnicos."""
        parent_chain = self.utils.get_parent_chain(target_node, tree)
        from src_local.agents.Support.rule_definition_judge import RuleDefinitionJudge
        if RuleDefinitionJudge().is_in_analyzer_context(parent_chain):
            return True
        
        return self.assignment_engine.is_in_metadata_assignment(parent_chain, target_node, self.utils, self.safe_metadata_vars)


    def is_meta_analysis_node(self, node):
        """🚀 Delegado: Detecta meta-análise via MetaAnalysisDetector."""
        from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector
        return MetaAnalysisDetector().is_meta_analysis_node(node)


