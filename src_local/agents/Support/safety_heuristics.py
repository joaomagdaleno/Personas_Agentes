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
        """🧠 Análise Semântica: Verifica se o nó faz parte de uma estrutura de dados de metadados técnicos ou lógica de auditoria."""
        from src_local.agents.Support.safety_definitions import ANALYZER_CLASSES, ANALYZER_METHODS
        parent_chain = self.utils.get_parent_chain(target_node, tree)
        
        for parent in parent_chain:
            # Check 1: Funções Core ou Atribuições Diretas
            if isinstance(parent, ast.FunctionDef) and (parent.name in CORE_PERFORMANCE_FUNCS or parent.name in ANALYZER_METHODS):
                return True
            if isinstance(parent, ast.ClassDef) and parent.name in ANALYZER_CLASSES:
                return True
            if isinstance(parent, ast.Assign) and self._is_assignment_to_safe_metadata(parent):
                return True
            # Check 2: Dicionários de Metadados
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
        """🚀 Detecta se o nó é uma lógica de meta-análise (ex: isinstance(node, ast.Global))."""
        from src_local.agents.Support.safety_definitions import META_ANALYSIS_LIBS
        
        if not isinstance(node, ast.Call): return False
        
        # Check 1: isinstance(..., ast.XYZ)
        if isinstance(node.func, ast.Name) and node.func.id == 'isinstance':
            if len(node.args) >= 2:
                arg2 = node.args[1]
                # ast.Name ou ast.Attribute
                if isinstance(arg2, ast.Attribute) and isinstance(arg2.value, ast.Name) and arg2.value.id in META_ANALYSIS_LIBS:
                    return True
                if isinstance(arg2, ast.Name) and arg2.id in ['BinOp', 'Call', 'Global', 'Expr', 'Assign']:
                    return True

        # Check 2: re.search/match com padrões técnicos
        if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == 're':
            return True # Regex analysis is technically meta-analysis
            
        return False

