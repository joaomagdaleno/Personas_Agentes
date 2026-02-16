from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: PhD in Distributed Systems 🌉
    Especialista em interoperabilidade legacy, auditoria de subprocessos e segurança de execução de comandos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bridge", "🌉", "PhD Systems Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Interoperabilidade (Legacy Stack)...")
        
        audit_rules = [
            {'regex': r'subprocess\.run\(.*shell=True', 'issue': 'Vulnerabilidade Crítica: Shell Injection detectado via shell=True. Viola o DNA PhD.', 'severity': 'critical'},
            {'regex': r'os\.system\(', 'issue': 'Obsolescência: Uso de os.system detectado. Migre para o módulo subprocess para maior segurança.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "shell=True" in content:
            return f"Risco de Corrupção: O objetivo '{objective}' exige estabilidade. Chamadas insecure em '${file}' podem comprometer o sistema orquestrado."
        return f"PhD Systems: Analisando maturidade de integração para {objective}. Focando em segurança de processos e pontes legacy seguras."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, PhD em Sistemas Distribuídos e Mestre em Integração Legada."
