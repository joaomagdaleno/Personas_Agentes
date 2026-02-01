from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: PhD in System Observability & Real-time Telemetry (Flutter) 🗣️
    Especialista em instrumentação de logs e rastreamento de erros no Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Echo", "🗣️", "PhD Observability Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Visibilidade e Rastreabilidade Flutter...")
        
        audit_rules = [
            {'regex': r"print\(", 'issue': 'Aviso: Uso de print() em vez de log() do developer ou logger.', 'severity': 'medium'},
            {'regex': r"catch\s*\(\w+\)\s*\{\s*\}", 'issue': 'Cegueira: Ponto Cego detectado em Dart (except empty).', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "print(" in content:
            return f"Cegueira Operacional: O objetivo '{objective}' exige diagnóstico estruturado. Em '{file}', o uso de print() impede que a 'Orquestração de Inteligência Artificial' tenha logs rastreáveis."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em telemetria e rastro digital Flutter."
