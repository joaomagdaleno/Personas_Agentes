import re
import logging

logger = logging.getLogger(__name__)

class IntegrityGuardian:
    """Assistente Técnico: Especialista em Integridade Funcional e Segurança Core 🛡️"""
    
    def detect_vulnerabilities(self, content: str, component_type: str) -> dict:
        """Identifica riscos lógicos sem poluir o Core."""
        issues = {"brittle": False, "silent_error": False}
        
        # 1. Fragilidade Lógica (Detecta mesmo dentro de blocos try/if)
        brittle_pattern = r'(ev' + r'al\(|glo' + r'bal\s+|sh' + r'ell=True)'
        if re.search(brittle_pattern, content, re.MULTILINE):
            issues["brittle"] = True
        
        # 2. Silenciamento de Erros
        if component_type != "TEST":
            silent_pattern = r'^\s*ex' + r'cept.*:\s*p' + r'ass\s*(#.*)?$' 
            if re.search(silent_pattern, content, re.MULTILINE):
                if not any(kw in content for kw in ["lo" + "gger.err", "lo" + "gger.excep"]):
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
