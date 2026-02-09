"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Heurísticas de Segurança (SafetyHeuristics)
Função: Centralizar lógica de detecção de contextos seguros e perigosos via Análise Semântica de Intencionalidade.
"""
import ast
import logging
import time

logger = logging.getLogger(__name__)

class SafetyHeuristics:
    def __init__(self, utils):
        self.utils = utils
        self.safe_metadata_vars = [
            'rule', 'pattern', 'issue', 'regex', 'p_str', 'keyword', 'audit_rules', 
            'patterns', 'dangerous', 'veto_patterns', 'p_kw', 'e_kw', 
            'brittle_pattern', 'silent_pattern', 'target_pattern', 'fragilities',
            'part1', 'part2', 'part3', 'danger_kw', 'rules_def', 'reg_def',
            'keywords', 'tech_terms', 'financial_terms', 'forbidden', 'suggestions',
            'identities', 'log_performance', '_log_performance', '_log_perf'
        ]

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
        safe_methods = ['info', 'warning', 'error', 'debug', 'exception']
        for node in ast.walk(tree):
            if self.utils.is_call_to(node, safe_methods):
                if any(self.utils.is_descendant(target_node, arg) for arg in node.args):
                    return True
        return False

    def is_inside_rule_definition(self, target_node, tree):
        """🧠 Análise Semântica: Verifica se o nó faz parte de uma estrutura de dados de metadados técnicos."""
        # 1. Checa se o nó está dentro de uma função de infraestrutura técnica
        parent_chain = self.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.FunctionDef) and parent.name in ['log_performance', '_log_performance', '_log_perf']:
                return True
            if isinstance(parent, ast.Assign) and self._is_assignment_to_safe_metadata(parent):
                return True

        # 2. Caminha de baixo para cima na árvore para entender a intenção
        for parent in parent_chain:
            # Se chegamos em uma atribuição, checamos o nome da variável alvo
            if isinstance(parent, ast.Assign):
                if self._is_assignment_to_safe_metadata(parent):
                    logger.debug(f"Semantic Intent: Safe definition detected via assignment.")
                    return True
            
            # Se estamos dentro de um dicionário, checamos se a chave é técnica
            if isinstance(parent, ast.Dict):
                if self.utils.is_in_dict_value(parent, target_node, self.safe_metadata_vars):
                    logger.debug(f"Semantic Intent: Safe definition detected via dictionary key.")
                    return True
                    
        return False

    def _is_assignment_to_safe_metadata(self, node):
        """Verifica se a atribuição é para uma variável de metadados conhecida."""
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in self.safe_metadata_vars:
                return True
            if isinstance(target, ast.Attribute) and target.attr in self.safe_metadata_vars:
                return True
        return False
