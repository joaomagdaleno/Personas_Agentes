from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """Core: PhD in Control Theory 🌊"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Flow", "🌊", "PhD Orchestration Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Auditando Topologia de Fluxo...")
        
        audit_rules = [
            {'regex': r"if .*:\s+.*if .*:\s+.*if", 'issue': 'Complexidade: Arrow Pattern detectado.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        info = self.context_data.get(file, {})
        complexity = info.get("complexity", 1)
        if complexity > 15:
            return {
                "file": file,
                "issue": f"Entropia Lógica: Complexidade ({complexity}) excede Soberania (15)",
                "severity": "STRATEGIC",
                "context": self.name
            }
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em fluxos."
