import re
import logging

logger = logging.getLogger(__name__)

class IntegrityGuardian:
    """
    🛡️ Guardião de Integridade PhD.
    Especialista em entender a intencionalidade por trás de fragilidades estruturais.
    Não ignora padrões; decifra o contexto para validar a soberania.
    """
    
    def detect_vulnerabilities(self, content: str, component_type: str, ignore_test_context=False) -> dict:
        """
        🕵️ Analisa o conteúdo em busca de vulnerabilidades e antipadrões.
        Usa o LogicAuditor para entender se o uso é uma definição técnica ou um risco real.
        """
        issues = {"brittle": False, "silent_error": False}
        
        # Bypass automático para testes (a menos que forçado)
        if component_type == "TEST" and not ignore_test_context:
            return issues
        
        # Veto de Autoconsciência: Agentes são ferramentas técnicas por natureza.
        # No entanto, ainda auditamos a lógica interna para garantir que não haja erros silenciosos.
        
        from src_local.agents.Support.logic_auditor import LogicAuditor
        logic_auditor = LogicAuditor()

        # 1. Fragilidade Lógica (Padrão Amplo: Captura tudo para análise contextual)
        self._analyze_brittle_context(content, issues, logic_auditor, ignore_test_context)
        
        # 2. Silenciamento de Erros
        self._analyze_error_silencing(content, issues, logic_auditor, ignore_test_context)
                    
        return issues

    def _analyze_brittle_context(self, content, issues, logic_auditor, ignore_test_context):
        # Captura ampla de keywords sensíveis
        brittle_pattern = r"\b(eval|exec|global|shell=True)\b"
        for match in re.finditer(brittle_pattern, content):
            line_no = content[:match.start()].count('\n') + 1
            
            # Pergunta ao auditor: Qual o contexto/intencionalidade desta linha?
            is_safe, reason = logic_auditor.is_interaction_safe(content, line_no, "brittle", ignore_test_context=ignore_test_context)
            
            if not is_safe:
                # Se não for seguro (ex: lógica de produção sem justificativa técnica), marca o problema
                logger.warning(f"Entropia detectada: {match.group()} em contexto de risco na linha {line_no}. Motivo: {reason}")
                issues["brittle"] = True
                break # Uma falha já compromete o arquivo

    def _analyze_error_silencing(self, content, issues, logic_auditor, ignore_test_context):
        silent_pattern = 'except.*:\\s*pass'
        match = re.search(silent_pattern, content)
        if match:
            line_no = content[:match.start()].count('\n') + 1
            is_safe, reason = logic_auditor.is_interaction_safe(content, line_no, "except", ignore_test_context=ignore_test_context)
            if not is_safe:
                # Entende se há telemetria compensatória
                if not any(kw in content for kw in ['logger.err', 'logger.excep', "telemetry"]):
                    logger.warning(f"Cegueira operacional: Erro silenciado na linha {line_no} sem telemetria alternativa.")
                    issues["silent_error"] = True

    def is_relevant_file(self, file: str, stack: str) -> bool:
        """Determina se o arquivo pertence à stack ou é config global."""
        try:
            if stack == "Universal": return True
            ext_map = {"Flutter": ".dart", "Kotlin": ".kt", "Python": ".py"}
            return file.endswith(ext_map.get(stack, "")) or file.endswith((".yaml", ".xml", ".json", ".gradle", ".kts"))
        except Exception as e:
            logger.error(f"Erro ao validar relevância de arquivo: {e}", exc_info=True)
            return False

    def get_audit_mission(self, dna: dict, objective: str = None) -> str:
        """Define o objetivo estratégico da auditoria."""
        if objective: return objective
        mission = dna.get('core_mission', 'Software Proposital')
        return f"Otimizar o sistema de {mission}"