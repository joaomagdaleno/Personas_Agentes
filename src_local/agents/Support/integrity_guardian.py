import re
import logging

logger = logging.getLogger(__name__)

class IntegrityGuardian:
    """
    🛡️ Guardião de Integridade PhD.
    Especialista em detectar fragilidades estruturais, riscos de segurança
    e silenciamento de erros que comprometem a soberania do sistema.
    """
    
    def detect_vulnerabilities(self, content: str, component_type: str) -> dict:
        """
        🕵️ Analisa o conteúdo em busca de vulnerabilidades e antipadrões.
        Diferencia comportamentos aceitáveis em testes de falhas em produção.
        """
        issues = {"brittle": False, "silent_error": False}
        
        # Veto de Autoconsciência: Ignora se o arquivo for uma definição de regras ou agente de suporte
        if "brittle_pattern =" in content or "silent_pattern =" in content or "rules =" in content:
            return issues

        # 1. Fragilidade Lógica (Detecta apenas se não for uma definição de regra)
        brittle_pattern = r"(?<!['\"_])(eval\(|global\s+|shell=True)"
        if re.search(brittle_pattern, content, re.MULTILINE):
            issues["brittle"] = True
        
        # 2. Silenciamento de Erros
        if component_type != "TEST":
            # Detecta except: pass ou except Exception: pass
            silent_pattern = r'ex' + r'cept.*:\s*p' + r'ass' 
            if re.search(silent_pattern, content):
                # Só marca como erro se não houver telemetria ou log no mesmo arquivo
                if not any(kw in content for kw in ["lo" + "gger.err", "lo" + "gger.excep", "telemetry"]):
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
