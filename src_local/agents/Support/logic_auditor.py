"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Lógica (LogicAuditor)
Função: Detectar anti-padrões lógicos via análise semântica de intencionalidade.
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
        from src_local.agents.Support.semantic_context_analyst import SemanticContextAnalyst
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        self.judge = SafeContextJudge()
        self.silent_detector = SilentErrorDetector(self.judge)
        self.call_judge = CallSafetyJudge(self.judge)
        self.rule_judge = RuleDefinitionJudge()
        self.nav = ASTNavigator()
        self.analyst = SemanticContextAnalyst(self.nav.safety_nav.heuristics)

    def scan_flaws(self, tree, rel_path, lines, agent_name, ignore_test_context=False):
        """Delegado: Identifica padrões de falha lógica (try-except-pass) via AST."""
        return self.silent_detector.detect(tree, rel_path, lines, agent_name, ignore_test_context)

    def is_interaction_safe(self, content: str, line_number: int, risk_type: str, ignore_test_context=False) -> tuple:
        """⚖️ Validação profunda: Entende a diferença entre execução e definição."""
        try:
            tree = ast.parse(content)
            line_nodes = [n for n in ast.walk(tree) if getattr(n, 'lineno', -1) == line_number]
            
            if not line_nodes:
                return True, "Uso em comentário ou docstring validado como metadado seguro."

            # Delega auditoria da lista de nós
            return self._audit_nodes(line_nodes, tree, content, line_number, risk_type, ignore_test_context)
        except Exception as e:
            logger.error(f"Semantic analysis failure: {e}")
            return False, f"Falha na análise AST: {e}"

    def _audit_nodes(self, nodes, tree, content, line_no, risk_type, ignore_test):
        """Itera sobre nós da linha para classificar segurança."""
        final_reason = "Padrão de risco em contexto de execução real."
        
        for node in nodes:
            intent = self.analyst.classify_intent(node, tree)
            if intent == 'METADATA':
                return True, "Definição técnica (Metadata/Regra/Teste) validada como segura."

            if intent == 'OBSERVABILITY':
                res, reason = self._audit_observability(node, tree, ignore_test)
                if res is False: return False, reason
                continue

            # Auditoria de Lógica Real
            res, reason = self._audit_logic_node(node, tree, content, line_no, risk_type, ignore_test)
            if res is True: return True, reason # Safe detectado
            if reason: final_reason = reason

        # Check de fallback para texto
        if risk_type == "brittle" and not any(isinstance(n, (ast.Global, ast.Call)) for n in nodes):
            return True, "Palavra-chave detectada em texto/string, não em execução."
            
        return False, final_reason

    def _audit_observability(self, node, tree, ignore_test):
        """Valida se um log contém telemetria manual que deve ser padronizada."""
        if "time" in ast.dump(node):
            from src_local.agents.Support.telemetry_intent_judge import TelemetryIntentJudge
            tele_judge = TelemetryIntentJudge(self.nav.safety_nav.heuristics, self.judge)
            _, _, reason = tele_judge.judge_intent(node, tree, ignore_test)
            return False, f"{reason} [Severity: STRATEGIC]"
        return True, "Log informativo seguro."

    def _audit_logic_node(self, node, tree, content, line_no, risk_type, ignore_test):
        """Valida um nó individual em contexto de lógica real."""
        if not isinstance(node, (ast.Call, ast.BinOp, ast.Global, ast.Expr, ast.Assign)):
            return None, None

        # Telemetria em Lógica (Checa se há 'time' no dump do nó ou de seus filhos se BinOp)
        node_dump = ast.dump(node)
        if "time" in node_dump and ("Sub" in node_dump or "BinOp" in node_dump):
            from src_local.agents.Support.telemetry_intent_judge import TelemetryIntentJudge
            is_safe, _, reason = TelemetryIntentJudge(self.nav.safety_nav.heuristics, self.judge).judge_intent(node, tree, ignore_test)
            if reason:
                return is_safe, (reason + " [Severity: STRATEGIC]" if not is_safe else reason)

        # Global em Lógica
        lines = content.splitlines()
        if risk_type == "brittle" and line_no <= len(lines) and "global" in lines[line_no-1]:
            if isinstance(node, ast.Global):
                return False, "Uso de estado global detectado. [Severity: HIGH]"
            return None, None

        # Chamadas Perigosas
        if isinstance(node, ast.Call):
            return self.call_judge.validate(node, tree, ignore_test)
            
        return None, None
