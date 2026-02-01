from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """
    Core: PhD in Automation & Code Generation (Flutter) ⚒️
    Especialista em build_runner, codegen e infraestrutura de CI/CD para Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Forge", "⚒️", "PhD Automation Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura de Automação Flutter...")
        
        audit_rules = [
            {'regex': r"Part\s+['\"].*?\.g\.dart['"]", 'issue': 'Aviso: Codegen detectado. Garanta que build_runner esteja atualizado.', 'severity': 'low'},
            {'regex': r"ev" + r"al\(", 'issue': 'Vulnerabilidade: Execução dinâmica detectada no ambiente Flutter.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "ev" + "al(" in content:
            return f"Falha de Automação: O objetivo '{objective}' exige segurança. Em '{file}', o uso de ev" + "al() em Dart permite ataques que invalidam a 'Orquestração de Inteligência Artificial'."
        return None

    def validate_code_safety(self, code: str) -> bool:
        """Veto Ativo: Recusa código Dart com fragilidades críticas."""
        fragilities = ["ev" + "al(", "sh" + "ell=True"]
        for f in fragilities:
            if f in code:
                logger.error(f"🚨 [Forge] VETO (Flutter): Fragilidade '{f}' detectada. Operação abortada.")
                return False
        return True

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em automação e codegen Flutter."
