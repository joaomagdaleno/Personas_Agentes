from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Core: PhD in Product Strategy & Technical Scope (Flutter) 🔭
    Especialista em gestão de débitos técnicos, marcadores de incompletude e alinhamento de visão.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scope", "🔭", "PhD Product Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Escopo e Débitos Flutter...")
        
        audit_rules = [
            {'regex': r"//\s*TODO", 'issue': 'Débito Técnico: Marcador TODO detectado. Verifique pendências de entrega.', 'severity': 'low'},
            {'regex': r"throw\s+UnimplementedError\(\)", 'issue': 'Incompleitude: Funcionalidade prometida mas não implementada.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Scope agora delega a auditoria de escopo para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em estratégia de produto Flutter."
