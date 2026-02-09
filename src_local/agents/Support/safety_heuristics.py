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
        self.utils = utils
        self.safe_metadata_vars = SAFE_METADATA_VARS

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
        from src_local.agents.Support.rule_definition_judge import RuleDefinitionJudge
        parent_chain = self.utils.get_parent_chain(target_node, tree)
        
        # Delegado: Check de contexto de analisador
        if RuleDefinitionJudge().is_in_analyzer_context(parent_chain):
            return True
        
        for parent in parent_chain:
            if isinstance(parent, ast.Assign) and self._is_assignment_to_safe_metadata(parent):
                return True
            if isinstance(parent, ast.Dict) and self.utils.is_in_dict_value(parent, target_node, self.safe_metadata_vars):
                return True
        return False



    def _is_assignment_to_safe_metadata(self, node):
        """Verifica se a atribuição é para uma variável de metadados conhecida."""
        return any(self._is_safe_name(t) for t in node.targets)

    def _is_safe_name(self, node):
        """Valida se o nome do alvo da atribuição é técnico/seguro."""
        if isinstance(node, ast.Name) and node.id in self.safe_metadata_vars:
            return True
        return isinstance(node, ast.Attribute) and node.attr in self.safe_metadata_vars

    def is_meta_analysis_node(self, node):
        """🚀 Delegado: Detecta meta-análise via MetaAnalysisDetector."""
        from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector
        return MetaAnalysisDetector().is_meta_analysis_node(node)


