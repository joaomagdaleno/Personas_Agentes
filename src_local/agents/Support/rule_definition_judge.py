"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Juiz de Definição de Regras (RuleDefinitionJudge)
Função: Identificar se um nó AST é uma definição técnica de regra (Literal).
"""
import ast
import logging

logger = logging.getLogger(__name__)

class RuleDefinitionJudge:
    def validate(self, node, tree):
        """Valida se um literal de string está sendo usado de forma perigosa."""
        if not isinstance(node, (ast.Constant, getattr(ast, "Str", ast.Constant))):
            return True, "Não é um literal de string."

        from src_local.agents.Support.ast_navigator import ASTNavigator
        nav = ASTNavigator()
        
        # Se estiver dentro de uma definição de regra ou log, é seguro
        if nav.safety_nav.is_safe_context(node, tree):
            return True, "Literal em contexto seguro (Regra/Log)."

        if nav.safety_nav.is_being_executed(node, tree):
             return False, "String sendo executada dinamicamente!"
        
        return True, "Literal de string não executado (Seguro)."
