"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Analista de Contexto Semântico (SemanticContextAnalyst)
Função: Identificar a intencionalidade do código (Observabilidade, Definição ou Lógica).
"""
import ast
import logging

logger = logging.getLogger(__name__)

class SemanticContextAnalyst:
    def __init__(self, heuristics):
        self.heuristics = heuristics

    def classify_intent(self, node, tree):
        """
        🔍 Classifica a intenção do nó AST.
        Retorna: 'METADATA', 'OBSERVABILITY', ou 'LOGIC'
        """
        # 0. Checa se é uma chamada de meta-análise (ex: isinstance(n, ast.Global))
        if self.heuristics.is_meta_analysis_node(node):
            return 'METADATA'
        
        # 1. Checa se é uma definição de regra ou padrão técnico
        if self.heuristics.is_inside_rule_definition(node, tree):
            return 'METADATA'
            
        # 2. Checa se está dentro de uma chamada de log ou print para usuário
        if self.heuristics.is_inside_log_call(node, tree):
            return 'OBSERVABILITY'

        # 3. Checa se é uma comparação trivial com string literal (ex: "global" in line)
        if self._is_analysis_comparison(node, tree):
            return 'METADATA'
            
        # 4. Checa se é um teste (Contexto de validação)
        if self._is_inside_test_method(node, tree):
            return 'METADATA' # Testes são metadados de validação

        # 5. Padrão: É lógica de execução real
        return 'LOGIC'

    def _is_analysis_comparison(self, node, tree):
        """🔍 Detecta comparações de strings para análise (ex: 'time.time()' in content)."""
        from src_local.agents.Support.safety_definitions import TRIVIAL_COMPARE_KEYWORDS
        
        if isinstance(node, ast.Compare):
            for op in node.ops:
                if isinstance(op, ast.In):
                    left = node.left
                    if isinstance(left, ast.Constant) and isinstance(left.value, str):
                        if any(kw in left.value for kw in TRIVIAL_COMPARE_KEYWORDS):
                            return True
        return False


    def _is_inside_test_method(self, target_node, tree):
        """Identifica se o nó está dentro de uma função ou classe de teste."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.FunctionDef) and (parent.name.startswith('test_') or parent.name.endswith('_test')):
                return True
            if isinstance(parent, ast.ClassDef) and 'Test' in parent.name:
                return True
        return False

