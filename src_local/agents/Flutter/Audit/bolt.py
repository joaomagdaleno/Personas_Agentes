from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Core: PhD in Computational Efficiency (Flutter) ⚡
    Especialista em detecção de frames perdidos e loops bloqueantes em Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bolt", "⚡", "PhD Performance Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Eficiência no ecossistema Flutter...")
        
        # Regras específicas para Dart/Flutter
        audit_rules = [
            {'regex': r"while\s*\(true\)\s*\{\s*\}", 'issue': 'Gargalo: Busy-waiting detectado em Dart.', 'severity': 'critical'},
            {'regex': r"sleep\(", 'issue': 'Risco: Uso de sleep bloqueia a UI Thread do Flutter.', 'severity': 'high'},
            {'regex': r"for\s*\(var\s+i\s*=\s*0;\s*i\s*<\s*.*\.length;\s*i\+\+\)", 'issue': 'Otimização: Prefira .map() ou .forEach() para iteráveis em Dart.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "sleep(" in content:
            return f"Degradação de UX: O objetivo '{objective}' exige fluidez. Em '{file}', o uso de sleep() trava a Main Thread, impedindo a 'Orquestração de Inteligência Artificial' de manter 60fps."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em performance Flutter. Sua missão é garantir zero jank."
