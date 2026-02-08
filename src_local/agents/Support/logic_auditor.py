"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Lógica (LogicAuditor)
Função: Detectar anti-padrões lógicos via AST.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class LogicAuditor:
    """Assistente Técnico: Especialista em Integridade Lógica 🧠"""

    def __init__(self):
        from src_local.agents.Support.safe_context_judge import SafeContextJudge
        from src_local.agents.Support.silent_error_detector import SilentErrorDetector
        from src_local.agents.Support.call_safety_judge import CallSafetyJudge
        from src_local.agents.Support.rule_definition_judge import RuleDefinitionJudge
        
        self.judge = SafeContextJudge()
        self.silent_detector = SilentErrorDetector(self.judge)
        self.call_judge = CallSafetyJudge(self.judge)
        self.rule_judge = RuleDefinitionJudge()

    def scan_flaws(self, tree, rel_path, lines, agent_name, ignore_test_context=False):
        """Delegado: Identifica padrões de falha lógica (try-except-pass) via AST."""
        return self.silent_detector.detect(tree, rel_path, lines, agent_name, ignore_test_context)

    def is_interaction_safe(self, content: str, line_number: int, risk_type: str, ignore_test_context=False) -> tuple:
        """⚖️ Validação profunda: Retorna (is_safe, reason) para transparência total."""
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if getattr(node, 'lineno', -1) == line_number:
                    return self._dispatch_judge(node, tree, risk_type, ignore_test_context)
            
            return False, "Padrão de risco em contexto de execução potencial."
        except Exception as e:
            return False, f"Falha na análise AST: {e}"

    def _dispatch_judge(self, node, tree, risk_type, ignore_test_context):
        """Distribui o julgamento baseado no tipo de nó."""
        # 1. Chamadas perigosas
        if isinstance(node, ast.Call):
            return self.call_judge.validate(node, tree, ignore_test_context)

        # 2. Literais de string (Definição de regras)
        if isinstance(node, (ast.Constant, getattr(ast, "Str", ast.Constant))):
            return self.rule_judge.validate(node, tree)
        
        # 3. Fallback via Juiz AST
        if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
            return True, "Contexto técnico validado via AST."
            
        return False, "Padrão de risco em contexto de execução potencial."