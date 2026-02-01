from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Core: PhD in Distributed Systems & Transport Layers (Flutter) 🌐
    Especialista em resiliência de rede, protocolos HTTP/gRPC e timeouts Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nexus", "🌐", "PhD Network Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Transporte Flutter...")
        
        audit_rules = [
            {'regex': r"http\.get\(", 'issue': 'Resiliência: Uso da biblioteca http padrão. Considere Dio para melhor tratamento de erros e interceptores.', 'severity': 'medium'},
            {'regex': r"connectTimeout\s*:\s*null", 'issue': 'Fragilidade: Timeout de conexão infinito detectado.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "connectTimeout: null" in content:
            return f"Risco de Bloqueio: O objetivo '{objective}' exige reatividade. Em '{file}', a falta de timeout pode paralisar a 'Orquestração de Inteligência Artificial' em redes instáveis."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em redes e transporte Flutter."
