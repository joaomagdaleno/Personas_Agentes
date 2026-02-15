"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Juiz de Segurança de Chamada (CallSafetyJudge)
Função: Validar se chamadas a funções perigosas (eval, exec, os.system) são seguras.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class CallSafetyJudge:
    def __init__(self, judge):
        self.judge = judge

    def validate(self, node, tree, ignore_test_context):
        """Valida se uma chamada é inerentemente perigosa ou segura."""
        if not self._is_dangerous_call(node):
            return True, "Chamada validada como segura via AST."
        
        if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
            return True, "Execução dinâmica em contexto seguro (Teste/Log)."
            
        return False, "Padrão de risco em contexto de execução potencial."

    def _is_dangerous_call(self, node):
        if not isinstance(node, ast.Call): return False
        
        if isinstance(node.func, ast.Name) and node.func.id in ["eval", "exec"]:
            return True
        if isinstance(node.func, ast.Attribute) and node.func.attr == "system":
            return isinstance(node.func.value, ast.Name) and node.func.value.id == "os"
        return False
