from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: PhD in Distributed Systems (Kotlin) 🌉
    Especialista em interoperabilidade entre Java/Kotlin e chamadas nativas (JNI).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bridge", "🌉", "PhD Systems Architect", "Kotlin"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Interoperabilidade Kotlin...")
        
        audit_rules = [
            {'regex': r"external\s+fun", 'issue': 'Aviso: Uso de JNI detectado. Verifique segurança de memória nativa.', 'severity': 'high'},
            {'regex': r"@JvmOverloads", 'issue': 'Otimização: Verifique se as sobrecargas JVM estão gerando código redundante.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "external" in content:
            return f"Risco de Corrupção: O objetivo '{objective}' exige estabilidade. Em '{file}', o uso de chamadas externas JNI pode causar crashes que fogem do controle da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, arquiteto de pontes JVM/Nativas."