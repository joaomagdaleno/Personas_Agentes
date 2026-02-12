from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: PhD in Distributed Systems (Flutter) 🌉
    Especialista em pontes nativas (MethodChannels) e integração de APIs.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bridge", "🌉", "PhD Systems Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Interoperabilidade Flutter...")
        
        audit_rules = [
            {'regex': r"MethodChannel\(", 'issue': 'Aviso: Uso de canal nativo detectado. Garanta tipagem estrita.', 'severity': 'medium'},
            {'regex': r"dynamic\s+\w+\s*\(", 'issue': 'Fragilidade: Uso de dynamic em assinaturas de método. Use tipos fortes.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "dynamic" in content:
            return f"Quebra de Contrato: O objetivo '{objective}' exige previsibilidade. Em '{file}', o uso de 'dynamic' torna a 'Orquestração de Inteligência Artificial' vulnerável a erros em tempo de execução."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, arquiteto de integrações Flutter."
