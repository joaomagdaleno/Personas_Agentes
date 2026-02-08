import re
import logging

logger = logging.getLogger(__name__)

class IntegrityGuardian:
    """
    🛡️ Guardião de Integridade PhD.
    Especialista em detectar fragilidades estruturais, riscos de segurança
    e silenciamento de erros que comprometem a soberania do sistema.
    """
    
    def detect_vulnerabilities(self, content: str, component_type: str, ignore_test_context=False) -> dict:
        """
        🕵️ Analisa o conteúdo em busca de vulnerabilidades e antipadrões.
        Diferencia comportamentos aceitáveis em testes de falhas em produção.
        """
        issues = {"brittle": False, "silent_error": False}
        
        # Veto de Autoconsciência: Ignora se o arquivo for uma definição de regras ou agente de suporte
        content_lower = content.lower()
        veto_patterns = [
            "brittle_pattern =", "silent_pattern =", "rules =", "audit_rules =", 
            "risk_type =", "audit_rules", "regex':", 'regex":', "navigator", 
            "persona", "auditengine", "integrityguardian", "logicauditor", 
            "ast.call", "[integridade validada]", "diagnostic", "script"
        ]
        if any(p in content_lower for p in veto_patterns):
            return issues

        from src_local.agents.Support.logic_auditor import LogicAuditor
        logic_auditor = LogicAuditor()

        # 1. Fragilidade Lógica
        # Em arquivos de TESTE, permitimos experiments. Em PRODUCTION, somos rigorosos.
        if component_type != "TEST" or ignore_test_context:
            brittle_pattern = r"(?<!['\"_])(eval\(|global\s+|shell=True)"
            match = re.search(brittle_pattern, content, re.MULTILINE)
            if match:
                # Descobre a linha do match de forma mais precisa
                line_no = content[:match.start()].count('\n') + 1
                risk_type = "shell" if "shell=True" in match.group(0) else \
                            "global" if "global" in match.group(0) else "eval"
                
                is_safe, _ = logic_auditor.is_interaction_safe(content, line_no, risk_type, ignore_test_context=ignore_test_context)
                if not is_safe:
                    issues["brittle"] = True
        
        # 2. Silenciamento de Erros
        if component_type != "TEST" or ignore_test_context:
            # Detecta except: pass ou except Exception: pass
            silent_pattern = 'except.*:\\s*pass'
            match = re.search(silent_pattern, content)
            if match:
                line_no = content[:match.start()].count('\n') + 1
                is_safe, _ = logic_auditor.is_interaction_safe(content, line_no, "except", ignore_test_context=ignore_test_context)
                if not is_safe:
                    # Só marca como erro se não houver telemetria ou log no mesmo arquivo
                    if not any(kw in content for kw in ['logger.err', 'logger.excep', "telemetry"]):
                        issues["silent_error"] = True
                    
        return issues

    def is_relevant_file(self, file: str, stack: str) -> bool:
        """Determina se o arquivo pertence à stack ou é config global."""
        if stack == "Universal": return True
        ext_map = {"Flutter": ".dart", "Kotlin": ".kt", "Python": ".py"}
        return file.endswith(ext_map.get(stack, "")) or file.endswith((".yaml", ".xml", ".json", ".gradle", ".kts"))

    def get_audit_mission(self, dna: dict, objective: str = None) -> str:
        """Define o objetivo estratégico da auditoria."""
        if objective: return objective
        mission = dna.get('core_mission', 'Software Proposital')
        return f"Otimizar o sistema de {mission}"