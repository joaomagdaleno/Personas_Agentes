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
        """
        ⚖️ Validação profunda: Entende a diferença entre execução e definição.
        Retorna (is_safe, reason) onde 'reason' pode conter overrides de severidade.
        """
        try:
            tree = ast.parse(content)
            # Pegamos todos os nós que começam na linha alvo
            line_nodes = [n for n in ast.walk(tree) if getattr(n, 'lineno', -1) == line_number]
            
            if not line_nodes:
                # 🛡️ Se não há nós AST, a linha é provavelmente um comentário ou docstring.
                # Como o IntegrityGuardian detectou algo via Regex, entendemos que é apenas texto.
                return True, "Uso em comentário ou docstring validado como metadado seguro."

            # Análise Semântica de Intencionalidade
            final_reason = "Padrão de risco em contexto de execução real."
            final_severity = "MEDIUM"
            
            for node in line_nodes:
                intent = self.analyst.classify_intent(node, tree)
                
                # 1. Se qualquer nó na linha for METADATA, a linha toda é segura
                if intent == 'METADATA':
                    return True, "Definição técnica (Metadata/Regra/Teste) validada como segura."

                # 2. Se for OBSERVABILITY, sugerimos padronização
                if intent == 'OBSERVABILITY':
                    final_reason = "Uso em contexto de Observabilidade. [Severity: STRATEGIC]"
                    continue

                # 3. Lógica Real: Validamos contra riscos específicos
                if isinstance(node, (ast.Call, ast.BinOp)):
                    # Caso especial: Telemetria
                    if "time" in ast.dump(node):
                        from src_local.agents.Support.telemetry_intent_judge import TelemetryIntentJudge
                        tele_judge = TelemetryIntentJudge(self.nav.safety_nav.heuristics, self.judge)
                        is_safe, severity, reason = tele_judge.judge_intent(node, tree, ignore_test_context)
                        if is_safe: return True, reason
                        if severity == "STRATEGIC":
                            final_reason = f"{reason} [Severity: STRATEGIC]"
                            continue

                    if isinstance(node, ast.Call):
                        is_safe, reason = self.call_judge.validate(node, tree, ignore_test_context)
                        if not is_safe: 
                            final_reason = reason
                            break
            
            return False, final_reason
        except Exception as e:
            logger.error(f"Semantic analysis failure: {e}")
            return False, f"Falha na análise AST: {e}"