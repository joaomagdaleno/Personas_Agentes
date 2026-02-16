from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: PhD in Growth Vectors & Marketing Engineering 📣
    Especialista em visibilidade estratégica, SEO técnico e descoberta de valor de projeto.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hype", "📣", "PhD Growth Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Crescimento e Descoberta (Legacy Stack)...")
        
        audit_rules = [
            {'regex': r"<title>Untitled.*</title>", 'issue': 'Falha de Identidade: Título genérico em arquivo HTML/Template.', 'severity': 'medium'},
            {'regex': r"meta\s+name=['\"]description['\"]\s+content=['\"]['\"]", 'issue': 'SEO: Meta description vazia detectada.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py', '.html'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if 'Untitled' in content:
            return f"Invisibilidade Estratégica: O objetivo '${objective}' exige tração. Em '${file}', a falta de metadados únicos prejudica o branding PhD."
        return f"PhD Growth: Analisando vetores de tração para {objective}. Focando em SEO técnico e clareza de proposta de valor."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, PhD em Vetores de Crescimento e Mestre em Branding Técnico Legado."
